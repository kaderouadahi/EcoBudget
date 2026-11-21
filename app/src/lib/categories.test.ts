import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES } from '../data/defaults'
import type { Category } from '../data/model'
import { defaultIcon, nextOrder, PICKABLE_ICONS, validateCategoryName } from './categories'

const CATS = DEFAULT_CATEGORIES as Category[]

describe('validateCategoryName', () => {
  it('vide : message avec exemple', () => {
    expect(validateCategoryName('', CATS)).toBe('Donnez un nom à la catégorie, par exemple Enfants')
    expect(validateCategoryName('   ', CATS)).toBe('Donnez un nom à la catégorie, par exemple Enfants')
  })
  it('20 caractères au plus', () => {
    expect(validateCategoryName('a'.repeat(20), CATS)).toBeNull()
    expect(validateCategoryName('a'.repeat(21), CATS)).toBe('20 caractères au plus')
  })
  it('doublon refusé quelles que soient les majuscules et les espaces', () => {
    expect(validateCategoryName('sorties', CATS)).toBe('Cette catégorie existe déjà')
    expect(validateCategoryName('  Sorties  ', CATS)).toBe('Cette catégorie existe déjà')
    expect(validateCategoryName('AUTRES', CATS)).toBe('Cette catégorie existe déjà')
  })
  it('doublon reconnu même si le nom est collé avec des accents décomposés', () => {
    expect(validateCategoryName('E\u0301tudes', CATS)).toBe('Cette catégorie existe déjà')
  })
  it('en modification, garder son propre nom n’est pas un doublon', () => {
    expect(validateCategoryName('Sorties', CATS, 'sorties')).toBeNull()
    expect(validateCategoryName('sorties ', CATS, 'sorties')).toBeNull()
    expect(validateCategoryName('Repas', CATS, 'sorties')).toBe('Cette catégorie existe déjà')
  })
  it('nom libre accepté', () => {
    expect(validateCategoryName('Enfants', CATS)).toBeNull()
  })
})

describe('icônes', () => {
  it('l’icône « … » d’Autres et l’ancien nom ne sont jamais proposés ; chaque icône a un nom', () => {
    const keys = PICKABLE_ICONS.map((i) => i.key)
    expect(keys).not.toContain('Ellipsis')
    expect(keys).not.toContain('UtensilsCrossed')
    expect(PICKABLE_ICONS.find((i) => i.key === 'Baby')?.label).toBe('Bébé')
    expect(PICKABLE_ICONS.find((i) => i.key === 'Gift')?.label).toBe('Cadeau')
    expect(PICKABLE_ICONS.every((i) => i.label.length > 0)).toBe(true)
  })
  it('présélection (H13) : l’étiquette neutre, même si une autre catégorie l’utilise déjà', () => {
    expect(defaultIcon(CATS)).toBe('Tag')
    expect(defaultIcon([...CATS, { id: 'x', name: 'Enfants', icon: 'Tag', order: 7, locked: false }])).toBe('Tag')
  })
  it('en modification : l’icône actuelle', () => {
    expect(defaultIcon(CATS, 'Ticket')).toBe('Ticket')
  })
  it('ancien nom UtensilsCrossed (comptes d’avant le 19/11) traité comme Couverts', () => {
    const old = CATS.map((c) => (c.id === 'repas' ? { ...c, icon: 'UtensilsCrossed' } : c))
    expect(defaultIcon(old)).toBe('Tag')
    expect(defaultIcon(old, 'UtensilsCrossed')).toBe('Utensils')
  })
})

describe('nextOrder', () => {
  it('fin de liste, avant Autres', () => {
    expect(nextOrder(CATS)).toBe(7)
    expect(nextOrder([...CATS, { id: 'x', name: 'Enfants', icon: 'Baby', order: 7, locked: false }])).toBe(8)
  })
})

import type { Budget, Expense } from '../data/model'
import { visibleAlert } from './alert'
import { deleteCategoryPlan, deleteConfirmText, deleteMessage } from './categories'
import type { BatchOps } from './demo'

describe('suppression d’une catégorie', () => {
  const sorties = CATS.find((c) => c.id === 'sorties')!
  const E = (id: string, categoryId: string, date: string, amount = 1000): Expense => ({ id, amount, categoryId, date, createdAt: 1 })
  const expenses = [
    E('s1', 'sorties', '2026-08-10'), E('s2', 'sorties', '2026-10-27'), E('s3', 'sorties', '2026-11-21', 4500),
    E('a1', 'autres', '2026-11-02'), E('r1', 'repas', '2026-11-03'),
  ]
  const budgets: Budget[] = [{ id: 'sorties', amount: 5000 }, { id: 'repas', amount: 8000 }]

  // Magasin en mémoire qui applique les écritures groupées.
  type Store = { categories: Map<string, unknown>; expenses: Map<string, Record<string, unknown>>; budgets: Map<string, unknown> }
  const storeOf = (): Store => ({
    categories: new Map(CATS.map(({ id, ...d }) => [id, d])),
    expenses: new Map(expenses.map(({ id, ...d }) => [id, { ...d }])),
    budgets: new Map(budgets.map(({ id, ...d }) => [id, d])),
  })
  const apply = (s: Store, ops: BatchOps) => {
    for (const d of ops.deletes) (s as unknown as Record<string, Map<string, unknown>>)[d.name].delete(d.id)
    for (const w of ops.sets) (s as unknown as Record<string, Map<string, unknown>>)[w.name].set(w.id, { ...w.data })
  }
  const list = (s: Store): Expense[] => [...s.expenses.entries()].map(([id, d]) => ({ ...(d as Omit<Expense, 'id'>), id }))

  it('toutes les dépenses de la catégorie (tous mois) vont vers la cible ; budget supprimé', () => {
    const plan = deleteCategoryPlan(sorties, 'autres', expenses, budgets)!
    expect(plan.moved).toBe(3)
    const s = storeOf()
    apply(s, plan.ops)
    expect(s.categories.has('sorties')).toBe(false)
    expect(s.budgets.has('sorties')).toBe(false)
    expect(s.budgets.has('repas')).toBe(true)
    expect(['s1', 's2', 's3'].map((id) => s.expenses.get(id)!.categoryId)).toEqual(['autres', 'autres', 'autres'])
    expect(s.expenses.get('r1')!.categoryId).toBe('repas')
  })

  it('vers une autre catégorie choisie', () => {
    const s = storeOf()
    apply(s, deleteCategoryPlan(sorties, 'repas', expenses, budgets)!.ops)
    expect(s.expenses.get('s2')!.categoryId).toBe('repas')
  })

  it('« Annuler » rétablit catégorie, budget et seulement les dépenses déplacées', () => {
    const plan = deleteCategoryPlan(sorties, 'autres', expenses, budgets)!
    const s = storeOf()
    apply(s, plan.ops)
    apply(s, plan.undo)
    expect(s.categories.get('sorties')).toEqual({ name: 'Sorties', icon: 'Ticket', order: 3, locked: false })
    expect(s.budgets.get('sorties')).toEqual({ amount: 5000 })
    expect(['s1', 's2', 's3'].map((id) => s.expenses.get(id)!.categoryId)).toEqual(['sorties', 'sorties', 'sorties'])
    expect(s.expenses.get('a1')!.categoryId).toBe('autres') // déjà dans la cible : reste dans Autres
  })

  it('sans budget : rien à supprimer ni à rétablir côté budget', () => {
    const plan = deleteCategoryPlan(sorties, 'autres', expenses, [])!
    expect(plan.ops.deletes.filter((d) => d.name === 'budgets')).toEqual([])
    expect(plan.undo.sets.filter((w) => w.name === 'budgets')).toEqual([])
  })

  it('« Autres » ne peut pas être supprimée', () => {
    expect(deleteCategoryPlan(CATS.find((c) => c.id === 'autres')!, 'repas', expenses, budgets)).toBeNull()
  })

  it('carte d’alerte : disparaît si la dépense signalée change de catégorie, revient avec « Annuler »', () => {
    const alert = { expenseId: 's3', amount: 4500, categoryId: 'sorties', date: '2026-11-21', why: '…' }
    const plan = deleteCategoryPlan(sorties, 'autres', expenses, budgets)!
    const s = storeOf()
    expect(visibleAlert(alert, list(s))).not.toBeNull()
    apply(s, plan.ops)
    expect(visibleAlert(alert, list(s))).toBeNull()
    apply(s, plan.undo)
    expect(visibleAlert(alert, list(s))).not.toBeNull()
  })

  it('textes de la confirmation', () => {
    expect(deleteConfirmText('Sorties', 12, true)).toEqual([
      'Les 12 dépenses de Sorties ne seront pas perdues : elles seront déplacées dans la catégorie choisie ci-dessous.',
      'Le budget de Sorties sera supprimé.',
      "Vous pourrez l'annuler juste après.",
    ])
    expect(deleteConfirmText('Sorties', 1, false)).toEqual([
      'La dépense de Sorties ne sera pas perdue : elle sera déplacée dans la catégorie choisie ci-dessous.',
      "Vous pourrez l'annuler juste après.",
    ])
    expect(deleteConfirmText('Sorties', 0, false)).toEqual(['Aucune dépense dans Sorties.', "Vous pourrez l'annuler juste après."])
  })

  it('message après suppression', () => {
    expect(deleteMessage('Sorties', 12, 'Autres')).toBe('Catégorie supprimée : Sorties · 12 dépenses déplacées vers Autres')
    expect(deleteMessage('Sorties', 1, 'Repas')).toBe('Catégorie supprimée : Sorties · 1 dépense déplacée vers Repas')
    expect(deleteMessage('Sorties', 0, 'Autres')).toBe('Catégorie supprimée : Sorties')
  })
})
