import type { Category, Expense } from '../data/model'
import { addMonths, currentMonth, monthOf } from './month'

// Graphiques (HANDOFF H6, DECISIONS.md 20/11) : statistiques des dépenses seulement.
// Mois du 1er au dernier jour (DECISIONS.md 18/11) ; un mois sans dépense vaut 0 DA.

export const MAX_MONTHS = 6

/** Nuances de bleu nuit et de bleu vif de la charte ; jamais vert, orange ou rouge (réservés aux budgets). */
export const CHART_COLORS = ['#1E2B4F', '#3460E0', '#8FA8F5', '#5B6B8C', '#C9D5FA', '#A9B4C8']
export const BAR_SELECTED = '#1E2B4F'
export const BAR_OTHER = '#C9D5FA'

const SHORT = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.']

/** « Nov. » */
export function shortMonth(month: string): string {
  return SHORT[Number(month.slice(5, 7)) - 1]
}

/** Mois en cours et jusqu'à 5 avant, sans remonter avant le mois de la plus ancienne dépense ; ordre croissant. */
export function coveredMonths(expenses: Expense[], today: Date): string[] {
  const M = currentMonth(today)
  const oldest = expenses.reduce<string | null>((min, e) => {
    const m = monthOf(e.date)
    return min === null || m < min ? m : min
  }, null)
  const earliest = addMonths(M, -(MAX_MONTHS - 1))
  const start = oldest === null || oldest > M ? M : oldest > earliest ? oldest : earliest
  const months: string[] = []
  for (let m = start; m <= M; m = addMonths(m, 1)) months.push(m)
  return months
}

/** Catégorie d'une dépense ; une catégorie inconnue (supprimée) compte dans « Autres ». */
function categoryOf(e: Expense, known: Set<string>): string {
  return known.has(e.categoryId) ? e.categoryId : 'autres'
}

/** Total par mois, pour toutes les dépenses (categoryId null) ou une catégorie. */
export function monthlyTotals(
  expenses: Expense[],
  categories: Category[],
  months: string[],
  categoryId: string | null,
): { month: string; total: number }[] {
  const known = new Set(categories.map((c) => c.id))
  const totals = new Map(months.map((m) => [m, 0]))
  for (const e of expenses) {
    const m = monthOf(e.date)
    if (!totals.has(m)) continue
    if (categoryId !== null && categoryOf(e, known) !== categoryId) continue
    totals.set(m, totals.get(m)! + e.amount)
  }
  return months.map((month) => ({ month, total: totals.get(month)! }))
}

/**
 * Pourcentage arrondi à l'unité ; « moins de 1 % » pour une part non nulle qui serait arrondie à 0 ;
 * au plus 99 % tant que la catégorie n'est pas seule (jamais « 100 % » à côté d'une autre part, comme H2 et H4).
 */
export function percentLabel(amount: number, total: number): string {
  if (total <= 0) return '0 %'
  const p = Math.round((amount * 100) / total)
  if (p === 0 && amount > 0) return 'moins de 1 %'
  return `${amount < total ? Math.min(p, 99) : p} %`
}

/**
 * Couleur fixe d'une catégorie, selon l'ordre des catégories : une catégorie garde sa couleur
 * d'un mois à l'autre (CLAUDE.md §8, code couleur constant). Catégorie inconnue = couleur d'« Autres ».
 */
export function categoryColor(categoryId: string, categories: Category[]): string {
  const ordered = [...categories].sort((a, b) => a.order - b.order).map((c) => c.id)
  const index = ordered.indexOf(ordered.includes(categoryId) ? categoryId : 'autres')
  return CHART_COLORS[Math.max(0, index) % CHART_COLORS.length]
}

export interface BreakdownRow {
  categoryId: string
  name: string
  amount: number
  percent: string
}

/** Répartition d'un mois : une ligne par catégorie avec dépense, montant décroissant puis ordre des catégories. */
export function breakdown(expenses: Expense[], categories: Category[], month: string): { total: number; rows: BreakdownRow[] } {
  const known = new Set(categories.map((c) => c.id))
  const sums = new Map<string, number>()
  for (const e of expenses) {
    if (monthOf(e.date) !== month) continue
    const id = categoryOf(e, known)
    sums.set(id, (sums.get(id) ?? 0) + e.amount)
  }
  const total = [...sums.values()].reduce((a, b) => a + b, 0)
  const order = new Map(categories.map((c) => [c.id, c.order]))
  const name = new Map(categories.map((c) => [c.id, c.name]))
  const rows = [...sums.entries()]
    .filter(([, amount]) => amount > 0)
    .sort(([a, x], [b, y]) => y - x || (order.get(a) ?? 999) - (order.get(b) ?? 999))
    .map(([categoryId, amount]) => ({ categoryId, name: name.get(categoryId) ?? 'Autres', amount, percent: percentLabel(amount, total) }))
  return { total, rows }
}
