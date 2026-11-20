import { DEFAULT_CATEGORIES } from '../data/defaults'
import type { Budget, Category, Contribution, Expense, Goal } from '../data/model'
import { addMonths, currentMonth } from './month'

// Jeu de démo (innovation.md §5.2, HANDOFF H8, DECISIONS.md 20/11) : dates relatives au jour du chargement,
// ids fixes (charger deux fois donne le même état). Tous les jours utilisés (≤ 28) existent dans chaque mois.

export interface DemoData {
  categories: Category[]
  expenses: Expense[]
  budgets: Budget[]
  goals: Goal[]
  contributions: Contribution[]
}

/** Sorties, M-4 à M-1 : [jour, montant] (innovation.md §5.2). */
const SORTIES: Record<number, [number, number][]> = {
  4: [[3, 800], [9, 900], [15, 1000], [21, 1100], [26, 1200]],
  3: [[2, 600], [8, 900], [14, 1000], [20, 1100], [27, 1200]],
  2: [[4, 700], [10, 1000], [16, 1000], [22, 1200], [27, 1300]],
  1: [[2, 600], [6, 800], [10, 1000], [14, 1000], [18, 1000], [22, 1200], [27, 1400]],
}

/** Catégories stables chaque mois (HANDOFF H8). */
const STABLE: { categoryId: string; amount: number; days: number[] }[] = [
  { categoryId: 'courses', amount: 7500, days: [3, 10, 17, 24] },
  { categoryId: 'transport', amount: 500, days: [2, 7, 12, 17, 22, 27] },
  { categoryId: 'repas', amount: 750, days: [1, 5, 8, 12, 15, 19, 22, 26] },
]

const BUDGETS: Budget[] = [
  { id: 'courses', amount: 40000 },
  { id: 'repas', amount: 8000 },
  { id: 'transport', amount: 4000 },
  { id: 'sorties', amount: 5000 },
]

const pad = (n: number) => String(n).padStart(2, '0')
const iso = (month: string, day: number) => `${month}-${pad(day)}`
const stamp = (month: string, day: number, i: number) => {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m - 1, day, 12).getTime() + i
}

export function buildDemoData(today: Date): DemoData {
  const M = currentMonth(today)
  const todayDay = today.getDate()
  const expenses: Expense[] = []
  const push = (month: string, day: number, categoryId: string, amount: number) => {
    const i = expenses.length
    expenses.push({ id: `demo-e-${month}-${pad(day)}-${categoryId}`, amount, categoryId, date: iso(month, day), createdAt: stamp(month, day, i) })
  }

  for (const k of [4, 3, 2, 1]) {
    const month = addMonths(M, -k)
    for (const [day, amount] of SORTIES[k]) push(month, day, 'sorties', amount)
    for (const s of STABLE) for (const day of s.days) push(month, day, s.categoryId, s.amount)
  }
  // Mois en cours : mêmes dépenses stables, seulement jusqu'à aujourd'hui ; aucune en Sorties.
  for (const s of STABLE) for (const day of s.days) if (day <= todayDay) push(M, day, s.categoryId, s.amount)

  const created = addMonths(M, -5)
  const goals: Goal[] = [
    { id: 'demo-g-ordinateur', name: 'Ordinateur portable', target: 150000, targetMonth: addMonths(M, 7), createdAt: stamp(created, 1, 0) },
    { id: 'demo-g-reserve', name: 'Réserve de sécurité', target: 50000, targetMonth: addMonths(M, 13), createdAt: stamp(created, 1, 1) },
  ]
  const contributions: Contribution[] = []
  for (const k of [4, 3, 2, 1]) {
    const month = addMonths(M, -k)
    contributions.push({ id: `demo-c-ordinateur-${month}`, goalId: 'demo-g-ordinateur', amount: 22500, date: iso(month, 28), createdAt: stamp(month, 28, 0) })
    contributions.push({ id: `demo-c-reserve-${month}`, goalId: 'demo-g-reserve', amount: 3000, date: iso(month, 28), createdAt: stamp(month, 28, 1) })
  }

  return {
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    expenses,
    budgets: BUDGETS.map((b) => ({ ...b })),
    goals,
    contributions,
  }
}
