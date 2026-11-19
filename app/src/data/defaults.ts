import {
  Baby, BookOpen, BusFront, Car, Dumbbell, Ellipsis, Gift, Heart, House, PawPrint, Plane, Shirt,
  ShoppingCart, Smartphone, Ticket, Utensils, Wrench, type LucideIcon,
} from 'lucide-react'
import type { Category, WithoutId } from './model'

// Catégories prêtes à la première ouverture (HANDOFF H1). Ids fixes : les recréer ne fait pas de doublon.
export const DEFAULT_CATEGORIES: (WithoutId<Category> & { id: string })[] = [
  { id: 'repas', name: 'Repas', icon: 'Utensils', order: 0, locked: false },
  { id: 'courses', name: 'Courses', icon: 'ShoppingCart', order: 1, locked: false },
  { id: 'transport', name: 'Transport', icon: 'BusFront', order: 2, locked: false },
  { id: 'sorties', name: 'Sorties', icon: 'Ticket', order: 3, locked: false },
  { id: 'sante', name: 'Santé', icon: 'Heart', order: 4, locked: false },
  { id: 'logement', name: 'Logement', icon: 'House', order: 5, locked: false },
  { id: 'etudes', name: 'Études', icon: 'BookOpen', order: 6, locked: false },
  { id: 'autres', name: 'Autres', icon: 'Ellipsis', order: 99, locked: true },
]

// Liste fermée d'icônes (jamais tout lucide : poids du bundle et précache hors connexion).
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Utensils, ShoppingCart, BusFront, Ticket, Heart, House, BookOpen, Ellipsis,
  Baby, Gift, Shirt, Smartphone, Car, PawPrint, Dumbbell, Plane, Wrench,
  UtensilsCrossed: Utensils, // ancien nom, données déjà créées
}

export function categoryIcon(name: string | undefined): LucideIcon {
  return (name && CATEGORY_ICONS[name]) || Ellipsis
}
