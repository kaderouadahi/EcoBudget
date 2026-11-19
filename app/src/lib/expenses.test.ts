import { describe, expect, it } from 'vitest'
import type { Category, Expense } from '../data/model'
import { expenseTitle, latestExpenses, parseAmount, proposedCategoryId, validateDate } from './expenses'

const cat = (id: string, name: string, order = 0): Category => ({ id, name, icon: 'Ellipsis', order, locked: false })
const exp = (id: string, p: Partial<Expense> = {}): Expense => ({
  id, amount: 100, categoryId: 'repas', date: '2026-11-10', createdAt: 0, ...p,
})
const CATS = [cat('repas', 'Repas', 0), cat('courses', 'Courses', 1), cat('autres', 'Autres', 7)]

describe('parseAmount', () => {
  it('entier valide', () => {
    expect(parseAmount('250')).toEqual({ ok: true, value: 250 })
  })
  it('espaces de milliers acceptés', () => {
    expect(parseAmount(' 2 500 ')).toEqual({ ok: true, value: 2500 })
  })
  it('vide', () => {
    expect(parseAmount('')).toEqual({ ok: false, error: 'Saisissez un montant en dinars, par exemple 250' })
  })
  it('décimal refusé, virgule ou point', () => {
    const error = 'Sans centimes : saisissez un nombre entier, par exemple 250'
    expect(parseAmount('2,5')).toEqual({ ok: false, error })
    expect(parseAmount('2.5')).toEqual({ ok: false, error })
  })
  it('nul ou négatif refusé', () => {
    const error = 'Le montant doit être supérieur à 0, par exemple 250'
    expect(parseAmount('0')).toEqual({ ok: false, error })
    expect(parseAmount('-50')).toEqual({ ok: false, error })
  })
  it('texte non numérique', () => {
    expect(parseAmount('abc')).toEqual({ ok: false, error: 'Saisissez un montant en dinars, par exemple 250' })
  })
})

describe('validateDate', () => {
  const today = new Date(2026, 10, 19)
  it('aujourd’hui et passé acceptés', () => {
    expect(validateDate('2026-11-19', today)).toBeNull()
    expect(validateDate('2026-01-02', today)).toBeNull()
  })
  it('futur refusé', () => {
    expect(validateDate('2026-11-20', today)).toBe('La date ne peut pas être dans le futur')
  })
  it('vide', () => {
    expect(validateDate('', today)).toBe('Choisissez une date')
  })
})

describe('proposedCategoryId', () => {
  it('Repas pour la toute première dépense', () => {
    expect(proposedCategoryId([], CATS)).toBe('repas')
  })
  it('catégorie de la dernière dépense enregistrée', () => {
    const list = [exp('a', { categoryId: 'repas', createdAt: 1 }), exp('b', { categoryId: 'courses', createdAt: 5, date: '2026-01-01' })]
    expect(proposedCategoryId(list, CATS)).toBe('courses')
  })
  it('catégorie disparue : Repas', () => {
    expect(proposedCategoryId([exp('a', { categoryId: 'supprimee', createdAt: 3 })], CATS)).toBe('repas')
  })
  it('sans Repas : première catégorie', () => {
    expect(proposedCategoryId([], [cat('autres', 'Autres', 7), cat('x', 'X', 1)])).toBe('x')
  })
})

describe('latestExpenses', () => {
  it('les 4 plus récentes, par date puis ordre de saisie', () => {
    const list = [
      exp('old', { date: '2026-11-01' }),
      exp('d1', { date: '2026-11-19', createdAt: 1 }),
      exp('d2', { date: '2026-11-19', createdAt: 2 }),
      exp('y', { date: '2026-11-18' }),
      exp('z', { date: '2026-11-15' }),
    ]
    expect(latestExpenses(list).map((e) => e.id)).toEqual(['d2', 'd1', 'y', 'z'])
  })
})

describe('expenseTitle', () => {
  it('la note si présente, sinon la catégorie', () => {
    expect(expenseTitle(exp('a', { note: 'Cafétéria' }), CATS[0])).toBe('Cafétéria')
    expect(expenseTitle(exp('a', { note: '  ' }), CATS[0])).toBe('Repas')
    expect(expenseTitle(exp('a'), undefined)).toBe('Autres')
  })
})
