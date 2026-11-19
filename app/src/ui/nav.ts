import { ChartPie, House, Plus, SlidersHorizontal, Target, Wallet, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

// Une seule source pour téléphone et ordinateur : mêmes entrées, mêmes libellés (C6).
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Accueil', icon: House },
  { to: '/budgets', label: 'Budgets', icon: Wallet },
  { to: '/graphiques', label: 'Graphiques', icon: ChartPie },
  { to: '/objectifs', label: 'Objectifs', icon: Target },
]

export const SETTINGS_ITEM: NavItem = { to: '/reglages', label: 'Réglages', icon: SlidersHorizontal }

export const ADD_EXPENSE: NavItem = { to: '/depense/nouvelle', label: 'Ajouter une dépense', icon: Plus }
