import type { Category, Expense } from '../data/model'
import { parseISODate } from './month'

// Règles de saisie d'une Dépense (HANDOFF H1) : erreurs au bon champ, avec la façon de corriger (C5).

export type AmountResult = { ok: true; value: number } | { ok: false; error: string }

export const AMOUNT_HELP = 'En dinars, sans centimes. Exemple : 250'
const EMPTY = 'Saisissez un montant en dinars, par exemple 250'
const DECIMAL = 'Sans centimes : saisissez un nombre entier, par exemple 250'
const NOT_POSITIVE = 'Le montant doit être supérieur à 0, par exemple 250'

export function parseAmount(text: string): AmountResult {
  const t = text.replace(/[\s  ]/g, '')
  if (t === '') return { ok: false, error: EMPTY }
  if (/^-?\d+[.,]\d*$/.test(t)) return { ok: false, error: DECIMAL }
  if (!/^-?\d+$/.test(t)) return { ok: false, error: EMPTY }
  const value = Number(t)
  if (value <= 0) return { ok: false, error: NOT_POSITIVE }
  return { ok: true, value }
}

export function validateDate(iso: string, today: Date): string | null {
  if (!iso) return 'Choisissez une date'
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (parseISODate(iso).getTime() > startOfToday.getTime()) return 'La date ne peut pas être dans le futur'
  return null
}

/** Catégorie proposée : celle de la dernière Dépense saisie, Repas pour la toute première (C2). */
export function proposedCategoryId(expenses: Expense[], categories: Category[]): string {
  const ids = new Set(categories.map((c) => c.id))
  const last = expenses.reduce<Expense | null>((acc, e) => (!acc || e.createdAt > acc.createdAt ? e : acc), null)
  if (last && ids.has(last.categoryId)) return last.categoryId
  if (ids.has('repas')) return 'repas'
  const sorted = [...categories].sort((a, b) => a.order - b.order)
  return sorted[0]?.id ?? 'autres'
}

/** Plus récentes d'abord : par date, puis par ordre de saisie. */
export function sortByRecent(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
}

export function latestExpenses(expenses: Expense[], n = 4): Expense[] {
  return sortByRecent(expenses).slice(0, n)
}

export function expenseTitle(e: Expense, c: Category | undefined): string {
  return e.note?.trim() || c?.name || 'Autres'
}
