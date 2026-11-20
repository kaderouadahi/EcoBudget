import type { Budget, Category, Expense } from '../data/model'
import type { BatchOps } from './demo'

// Catégories (HANDOFF H7, DECISIONS.md 17/11 et 20/11).

export const CATEGORY_NAME_MAX = 20
export const OTHER_ID = 'autres'

/** Icônes proposées : la liste prête, sans « … » (réservée à Autres) ni l'ancien nom UtensilsCrossed ; nom accessible pour chacune. */
export const PICKABLE_ICONS: { key: string; label: string }[] = [
  { key: 'Utensils', label: 'Couverts' },
  { key: 'ShoppingCart', label: 'Panier' },
  { key: 'BusFront', label: 'Bus' },
  { key: 'Ticket', label: 'Ticket' },
  { key: 'Heart', label: 'Cœur' },
  { key: 'House', label: 'Maison' },
  { key: 'BookOpen', label: 'Livre' },
  { key: 'Baby', label: 'Bébé' },
  { key: 'Gift', label: 'Cadeau' },
  { key: 'Shirt', label: 'Vêtement' },
  { key: 'Smartphone', label: 'Téléphone' },
  { key: 'Car', label: 'Voiture' },
  { key: 'PawPrint', label: 'Animal' },
  { key: 'Dumbbell', label: 'Sport' },
  { key: 'Plane', label: 'Avion' },
  { key: 'Wrench', label: 'Outil' },
]

const key = (name: string) => name.normalize('NFC').trim().toLocaleLowerCase('fr-FR')

/** Nom de catégorie : obligatoire, 20 caractères au plus, pas de doublon (majuscules et espaces ignorés). */
export function validateCategoryName(name: string, categories: Category[], ownId?: string): string | null {
  const t = name.normalize('NFC').trim()
  if (!t) return 'Donnez un nom à la catégorie, par exemple Enfants'
  if (t.length > CATEGORY_NAME_MAX) return `${CATEGORY_NAME_MAX} caractères au plus`
  if (categories.some((c) => c.id !== ownId && key(c.name) === key(t))) return 'Cette catégorie existe déjà'
  return null
}

/** Icône présélectionnée : l'actuelle en modification, sinon la première non utilisée par une autre catégorie. */
/** Ancien nom d'icône (comptes d'avant le 19/11) ramené à l'icône proposée. */
const canonicalIcon = (k: string) => (k === 'UtensilsCrossed' ? 'Utensils' : k)

export function defaultIcon(categories: Category[], current?: string): string {
  if (current) return canonicalIcon(current)
  const used = new Set(categories.map((c) => canonicalIcon(c.icon)))
  return (PICKABLE_ICONS.find((i) => !used.has(i.key)) ?? PICKABLE_ICONS[0]).key
}

/** Place d'une nouvelle catégorie : en fin de liste, juste avant « Autres ». */
export function nextOrder(categories: Category[]): number {
  return categories.filter((c) => !c.locked).reduce((max, c) => Math.max(max, c.order), -1) + 1
}

/**
 * Suppression d'une catégorie (DECISIONS.md 20/11) : toutes ses dépenses, quel que soit leur mois, vont vers la
 * catégorie choisie ; son budget est supprimé. `undo` rétablit la catégorie (même id, nom, icône, place), son budget
 * et seulement les dépenses déplacées. Écritures groupées (atomiques). « Autres » ne se supprime pas : null.
 */
export function deleteCategoryPlan(
  category: Category,
  targetId: string,
  expenses: Expense[],
  budgets: Budget[],
): { ops: BatchOps; undo: BatchOps; moved: number } | null {
  if (category.locked || category.id === targetId) return null
  const moved = expenses.filter((e) => e.categoryId === category.id)
  const budget = budgets.find((b) => b.id === category.id)
  const { id, ...categoryData } = category
  const ops: BatchOps = {
    deletes: [{ name: 'categories', id }, ...(budget ? [{ name: 'budgets' as const, id }] : [])],
    sets: moved.map(({ id: eid, ...e }) => ({ name: 'expenses' as const, id: eid, data: { ...e, categoryId: targetId } })),
  }
  const undo: BatchOps = {
    deletes: [],
    sets: [
      { name: 'categories', id, data: { ...categoryData } },
      ...(budget ? [{ name: 'budgets' as const, id, data: { amount: budget.amount } }] : []),
      ...moved.map(({ id: eid, ...e }) => ({ name: 'expenses' as const, id: eid, data: { ...e } })),
    ],
  }
  return { ops, undo, moved: moved.length }
}

/** Phrases de la confirmation de suppression (maquette telephone-09, DECISIONS.md 20/11). */
export function deleteConfirmText(name: string, count: number, hasBudget: boolean): string[] {
  const lines = [
    count === 0
      ? `Aucune dépense dans ${name}.`
      : count === 1
        ? `La dépense de ${name} ne sera pas perdue : elle sera déplacée dans la catégorie choisie ci-dessous.`
        : `Les ${count} dépenses de ${name} ne seront pas perdues : elles seront déplacées dans la catégorie choisie ci-dessous.`,
  ]
  if (hasBudget) lines.push(`Le budget de ${name} sera supprimé.`)
  lines.push("Vous pourrez l'annuler juste après.")
  return lines
}

/** « Catégorie supprimée : Sorties · 12 dépenses déplacées vers Autres » */
export function deleteMessage(name: string, count: number, targetName: string): string {
  if (count === 0) return `Catégorie supprimée : ${name}`
  const what = count === 1 ? '1 dépense déplacée' : `${count} dépenses déplacées`
  return `Catégorie supprimée : ${name} · ${what} vers ${targetName}`
}
