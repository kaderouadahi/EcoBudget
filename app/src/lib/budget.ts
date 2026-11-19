import type { Budget, Category, Expense } from '../data/model'
import { isInMonth } from './month'
import { formatDA } from './format'

// État d'un Budget (DECISIONS.md 17/11) : vert < 80 %, orange de 80 à 100 % inclus, rouge > 100 %.
// Calcul en entiers pour que 80 % pile tombe bien dans l'orange.

export type BudgetKind = 'ok' | 'warn' | 'over'

export function budgetState(spent: number, budget: number): { kind: BudgetKind; remaining: number } {
  const remaining = budget - spent
  if (spent > budget) return { kind: 'over', remaining }
  if (spent * 100 >= budget * 80) return { kind: 'warn', remaining }
  return { kind: 'ok', remaining }
}

/** Ajout au message de confirmation quand la dépense amène le Budget à 80 % ou plus (DECISIONS.md 18/11). */
export function budgetNotice(
  categoryName: string,
  spent: number,
  budget: number,
): { text: string; tone: 'warn' | 'danger' } | null {
  const { kind, remaining } = budgetState(spent, budget)
  if (kind === 'ok') return null
  if (kind === 'warn') return { text: `${categoryName} : il reste ${formatDA(remaining)}`, tone: 'warn' }
  return { text: `${categoryName} : dépassé de ${formatDA(-remaining)}`, tone: 'danger' }
}

// --- Synthèse du mois (HANDOFF H2) ---

export interface BudgetRow {
  categoryId: string
  amount: number
  spent: number
  kind: BudgetKind
  remaining: number
  percent: number
}

export interface BudgetSummary {
  rows: BudgetRow[]
  offBudget: { categoryId: string; spent: number }[]
  totalBudget: number
  spentInBudgets: number
  /** Somme des budgets fixés − dépenses du mois de ces catégories (DECISIONS.md 17/11). */
  remaining: number
  spentTotal: number
}

/** Pourcentage affiché, toujours d'accord avec la couleur : arrondi par défaut (79,9 % reste « 79 % » en vert),
 * et au moins 101 % dès que le budget est dépassé. */
export function percent(spent: number, budget: number): number {
  if (budget <= 0) return 0
  const p = Math.floor((spent * 100) / budget)
  return spent > budget ? Math.max(101, p) : p
}

export function barRatio(spent: number, budget: number): number {
  if (budget <= 0) return 0
  return Math.min(1, Math.max(0, spent / budget))
}

export function spentByCategory(expenses: Expense[], month: string): Map<string, number> {
  const map = new Map<string, number>()
  for (const e of expenses) {
    if (isInMonth(e.date, month)) map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount)
  }
  return map
}

export function budgetSummary(budgets: Budget[], categories: Category[], expenses: Expense[], month: string): BudgetSummary {
  const spent = spentByCategory(expenses, month)
  const byCategory = new Map(budgets.map((b) => [b.id, b.amount]))
  const ordered = [...categories].sort((a, b) => a.order - b.order)
  const rows: BudgetRow[] = []
  for (const c of ordered) {
    const amount = byCategory.get(c.id)
    if (amount === undefined) continue
    const s = spent.get(c.id) ?? 0
    const { kind, remaining } = budgetState(s, amount)
    rows.push({ categoryId: c.id, amount, spent: s, kind, remaining, percent: percent(s, amount) })
  }
  const inBudget = new Set(rows.map((r) => r.categoryId))
  const offBudget = [...spent.entries()]
    .filter(([id, s]) => !inBudget.has(id) && s > 0)
    .map(([categoryId, s]) => ({ categoryId, spent: s }))
    .sort((a, b) => b.spent - a.spent)
  const totalBudget = rows.reduce((t, r) => t + r.amount, 0)
  const spentInBudgets = rows.reduce((t, r) => t + r.spent, 0)
  const spentTotal = [...spent.values()].reduce((t, s) => t + s, 0)
  return { rows, offBudget, totalBudget, spentInBudgets, remaining: totalBudget - spentInBudgets, spentTotal }
}

/** Chiffre principal de l'Accueil (C1). */
export function headline(s: BudgetSummary, monthLabel: string): { label: string; value: number; tone: 'neutral' | 'danger' } {
  if (s.rows.length === 0) return { label: 'Dépensé ce mois', value: s.spentTotal, tone: 'neutral' }
  if (s.remaining < 0) return { label: 'Budgets dépassés de', value: -s.remaining, tone: 'danger' }
  return { label: `Reste à dépenser en ${monthLabel}`, value: s.remaining, tone: 'neutral' }
}
