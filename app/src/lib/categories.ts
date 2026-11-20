import type { Category } from '../data/model'

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

const key = (name: string) => name.trim().toLocaleLowerCase('fr-FR')

/** Nom de catégorie : obligatoire, 20 caractères au plus, pas de doublon (majuscules et espaces ignorés). */
export function validateCategoryName(name: string, categories: Category[], ownId?: string): string | null {
  const t = name.trim()
  if (!t) return 'Donnez un nom à la catégorie, par exemple Enfants'
  if (t.length > CATEGORY_NAME_MAX) return `${CATEGORY_NAME_MAX} caractères au plus`
  if (categories.some((c) => c.id !== ownId && key(c.name) === key(t))) return 'Cette catégorie existe déjà'
  return null
}

/** Icône présélectionnée : l'actuelle en modification, sinon la première non utilisée par une autre catégorie. */
export function defaultIcon(categories: Category[], current?: string): string {
  if (current) return current
  const used = new Set(categories.map((c) => c.icon))
  return (PICKABLE_ICONS.find((i) => !used.has(i.key)) ?? PICKABLE_ICONS[0]).key
}

/** Place d'une nouvelle catégorie : en fin de liste, juste avant « Autres ». */
export function nextOrder(categories: Category[]): number {
  return categories.filter((c) => !c.locked).reduce((max, c) => Math.max(max, c.order), -1) + 1
}
