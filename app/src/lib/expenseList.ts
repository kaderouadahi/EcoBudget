import type { Expense } from '../data/model'
import { sortByRecent } from './expenses'
import { formatDA } from './format'
import { addMonths, currentMonth, monthOf } from './month'

// Liste des dépenses du mois (HANDOFF H10). Mois du 1er au dernier jour (DECISIONS.md 18/11).

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

/**
 * Mois couverts, croissants : du mois de la plus ancienne dépense au mois en cours, sans limite
 * (Graphiques en garde 6 au plus). `keep` (mois de l'URL) fait commencer la liste plus tôt s'il est
 * bien formé, pas dans le futur et plus ancien que la plus ancienne dépense : après la suppression
 * de la seule dépense de ce mois, l'écran reste dessus et « Annuler » garde son sens.
 */
export function listMonths(expenses: Expense[], today: Date, keep?: string | null): string[] {
  const M = currentMonth(today)
  let start = M
  for (const e of expenses) {
    const m = monthOf(e.date)
    if (m < start) start = m
  }
  if (keep && MONTH.test(keep) && keep < start) start = keep
  const months: string[] = []
  for (let m = start; m <= M; m = addMonths(m, 1)) months.push(m)
  return months
}

/** Dépenses du mois groupées par jour : jours du plus récent au plus ancien, dernière saisie en premier. */
export function groupByDay(expenses: Expense[], month: string): { date: string; expenses: Expense[] }[] {
  const groups: { date: string; expenses: Expense[] }[] = []
  for (const e of sortByRecent(expenses.filter((x) => monthOf(x.date) === month))) {
    const last = groups[groups.length - 1]
    if (last?.date === e.date) last.expenses.push(e)
    else groups.push({ date: e.date, expenses: [e] })
  }
  return groups
}

export function monthTotal(expenses: Expense[], month: string): { total: number; count: number } {
  const inMonth = expenses.filter((e) => monthOf(e.date) === month)
  return { total: inMonth.reduce((sum, e) => sum + e.amount, 0), count: inMonth.length }
}

/** « Total : 29 000 DA · 12 dépenses » ; « 1 dépense » au singulier. */
export function summaryLabel(total: number, count: number): string {
  return `Total : ${formatDA(total)} · ${count} ${count > 1 ? 'dépenses' : 'dépense'}`
}
