import type { Expense, UnusualAlert } from '../data/model'
import { formatDA } from './format'
import { parseISODate, toISODate } from './month'

// Alerte de dépense inhabituelle (innovation.md §2.1, DECISIONS.md 18/11 et 19/11).
// Seuils : choix de conception, à ajuster après les tests L3.
export const MIN_HISTORY = 5
export const WINDOW_DAYS = 56 // 8 semaines
export const MAX_AGE_MONTHS = 6
export const FACTOR = 3
export const MIN_GAP_DA = 1000

export function median(values: number[]): number {
  const v = [...values].sort((a, b) => a - b)
  const mid = Math.floor(v.length / 2)
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2
}

const byRecent = (a: Expense, b: Expense) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt

/**
 * Historique de référence : autres dépenses de la même catégorie datées du même jour ou d'avant,
 * fenêtres comptées depuis la date de la dépense. null s'il n'y a pas assez de données.
 */
export function referenceHistory(
  e: { id?: string; categoryId: string; date: string },
  all: Expense[],
): Expense[] | null {
  const day = parseISODate(e.date)
  const windowStart = toISODate(new Date(day.getFullYear(), day.getMonth(), day.getDate() - WINDOW_DAYS))
  // Même jour 6 mois plus tôt, borné au dernier jour du mois (31 août → 28 février, pas 3 mars).
  const lastDay = new Date(day.getFullYear(), day.getMonth() - MAX_AGE_MONTHS + 1, 0).getDate()
  const maxAge = toISODate(new Date(day.getFullYear(), day.getMonth() - MAX_AGE_MONTHS, Math.min(day.getDate(), lastDay)))
  const same = all.filter((x) => x.categoryId === e.categoryId && x.id !== e.id && x.date <= e.date).sort(byRecent)
  const recent = same.filter((x) => x.date >= windowStart)
  if (recent.length >= MIN_HISTORY) return recent
  const lastFive = same.slice(0, MIN_HISTORY)
  if (lastFive.length < MIN_HISTORY) return null
  return lastFive[lastFive.length - 1].date > maxAge ? lastFive : null
}

export function checkUnusual(
  e: { id?: string; amount: number; categoryId: string; date: string },
  all: Expense[],
): { median: number; ratio: number; history: Expense[] } | null {
  const history = referenceHistory(e, all)
  if (!history) return null
  const m = median(history.map((x) => x.amount))
  if (m <= 0) return null
  const unusual = e.amount > FACTOR * m && e.amount >= m + MIN_GAP_DA
  return unusual ? { median: m, ratio: e.amount / m, history } : null
}

const dayMonth = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })

function sinceDate(oldestIso: string, expenseIso: string): string {
  const d = parseISODate(oldestIso)
  const text = dayMonth.format(d).replace(/^1 /, '1er ')
  return d.getFullYear() === parseISODate(expenseIso).getFullYear() ? text : `${text} ${d.getFullYear()}`
}

/** Phrase « Pourquoi ? » (innovation.md §2.2), toujours le même modèle (C6), chiffres et période (C1, C7). */
export function whySentence(
  categoryName: string,
  medianValue: number,
  ratio: number,
  n: number,
  oldestIso: string,
  expenseIso: string,
): string {
  const hundred = Math.round(medianValue / 100) * 100
  const usual = hundred > 0 ? hundred : Math.round(medianValue)
  const times = ratio.toFixed(1).replace('.', ',')
  return (
    `D'habitude, une dépense en ${categoryName} est d'environ ${formatDA(usual)}. ` +
    `Celle-ci est ${times} fois plus élevée. ` +
    `Calcul fait sur vos ${n} dépenses en ${categoryName} depuis le ${sinceDate(oldestIso, expenseIso)}.`
  )
}

/** La carte ne s'affiche que si la dépense signalée existe encore telle qu'au moment de l'alerte (DECISIONS.md 19/11). */
export function visibleAlert(alert: UnusualAlert | undefined, expenses: Expense[]): UnusualAlert | null {
  if (!alert) return null
  const e = expenses.find((x) => x.id === alert.expenseId)
  return e && e.amount === alert.amount && e.categoryId === alert.categoryId && e.date === alert.date ? alert : null
}
