// Modèle de données (HANDOFF H0, choix Claude Code). Tout est rangé sous users/{uid}.
// Dates : 'YYYY-MM-DD' (date locale) ; mois : 'YYYY-MM' ; montants : entiers en DA.

export type CollectionName = 'categories' | 'expenses' | 'budgets' | 'goals' | 'contributions'

export interface UserDoc {
  firstName?: string
  alertsEnabled: boolean
  adviceEnabled: boolean
  /** Conseil masqué jusqu'à ce mois inclus ('YYYY-MM'). */
  adviceHiddenUntil?: string
  onboardingDone: boolean
}

export interface Category {
  id: string
  name: string
  /** Nom d'icône lucide-react. */
  icon: string
  order: number
  /** « Autres » : non supprimable. */
  locked: boolean
}

export interface Expense {
  id: string
  amount: number
  categoryId: string
  date: string
  note?: string
  createdAt: number
}

/** Document d'id = categoryId ; reconduit chaque mois. */
export interface Budget {
  id: string
  amount: number
}

export interface Goal {
  id: string
  name: string
  target: number
  targetMonth: string
  createdAt: number
}

export interface Contribution {
  id: string
  goalId: string
  amount: number
  date: string
  createdAt: number
}

export type WithoutId<T> = Omit<T, 'id'>
