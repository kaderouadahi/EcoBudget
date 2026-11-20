import type { Category, Contribution, Expense, Goal, UserDoc } from '../data/model'
import { median } from './alert'
import { spentByCategory } from './budget'
import { formatDA } from './format'
import { monthLabel, savedAmount } from './goals'
import { addMonths, currentMonth, monthOf } from './month'

// Conseil d'épargne (innovation.md §2.4, DECISIONS.md 18/11 et 20/11, HANDOFF H5).
export const EXCLUDED_CATEGORIES = new Set(['sante', 'logement', 'autres'])
export const STEP_DA = 500

export interface Advice {
  goalId: string
  goalName: string
  targetMonth: string
  categoryId: string
  categoryName: string
  reduction: number
  /** Mois restants jusqu'au mois visé. */
  months: number
  /** Mois nécessaires avec la réduction. */
  needed: number
  gain: number
  /** Rythme prévu (non arrondi) : reste ÷ mois restants. */
  pace: number
  /** Total de la catégorie le mois dernier. */
  lastMonth: number
  /** Habitude : médiane des totaux des 3 mois précédents. */
  usual: number
}

const monthIndex = (m: string) => Number(m.slice(0, 4)) * 12 + Number(m.slice(5, 7)) - 1

export function computeAdvice(input: {
  goals: Goal[]
  contributions: Contribution[]
  expenses: Expense[]
  categories: Category[]
  user: UserDoc | null
  today: Date
}): Advice | null {
  const { goals, contributions, expenses, categories, user, today } = input
  const M = currentMonth(today)
  if (user?.adviceEnabled === false) return null
  if (user?.adviceHiddenUntil && user.adviceHiddenUntil >= M) return null

  // Historique suffisant : une dépense datée de M-4 ou avant.
  const M4 = addMonths(M, -4)
  if (!expenses.some((e) => monthOf(e.date) <= M4)) return null

  // Objectif : en cours (non atteint, mois visé après le mois en cours), le plus proche puis le plus ancien.
  const goal = goals
    .map((g) => ({ g, saved: savedAmount(g.id, contributions) }))
    .filter(({ g, saved }) => saved < g.target && g.targetMonth > M)
    .sort((a, b) => a.g.targetMonth.localeCompare(b.g.targetMonth) || a.g.createdAt - b.g.createdAt)[0]
  if (!goal) return null

  // Catégorie : plus forte hausse du mois dernier sur l'habitude (mois sans dépense = 0 DA).
  const totals = [1, 2, 3, 4].map((k) => spentByCategory(expenses, addMonths(M, -k)))
  let best: { c: Category; rise: number; last: number; usual: number } | null = null
  for (const c of [...categories].sort((a, b) => a.order - b.order)) {
    if (EXCLUDED_CATEGORIES.has(c.id)) continue
    const last = totals[0].get(c.id) ?? 0
    const usual = median([1, 2, 3].map((k) => totals[k].get(c.id) ?? 0))
    const rise = last - usual
    if (!best || rise > best.rise) best = { c, rise, last, usual }
  }
  if (!best) return null
  const reduction = Math.floor(best.rise / STEP_DA) * STEP_DA
  if (reduction <= 0) return null

  const months = monthIndex(goal.g.targetMonth) - monthIndex(M)
  const remaining = goal.g.target - goal.saved
  // ⌈reste × n ÷ (reste + réduction × n)⌉ en entiers.
  const num = remaining * months
  const den = remaining + reduction * months
  const needed = Math.floor((num + den - 1) / den)
  const gain = months - needed
  if (gain < 1) return null

  return {
    goalId: goal.g.id,
    goalName: goal.g.name,
    targetMonth: goal.g.targetMonth,
    categoryId: best.c.id,
    categoryName: best.c.name,
    reduction,
    months,
    needed,
    gain,
    pace: remaining / months,
    lastMonth: best.last,
    usual: best.usual,
  }
}

const hundred = (v: number) => Math.round(v / 100) * 100
/** Minuscule initiale, sauf pour un sigle (2ᵉ lettre majuscule : « EDF » reste « EDF »). */
const lowerFirst = (s: string) => {
  const second = s.charAt(1)
  if (second && second !== second.toLowerCase()) return s
  return s.charAt(0).toLowerCase() + s.slice(1)
}

/** Phrase de la carte Conseil. */
export function adviceText(a: Advice): string {
  const when = a.gain === 1 ? 'un mois' : `${a.gain} mois`
  return `En réduisant vos ${lowerFirst(a.categoryName)} de ${formatDA(a.reduction)} par mois, vous atteindriez « ${a.goalName} » ${when} plus tôt.`
}

/** Phrase « Pourquoi ? » (innovation.md §2.4) : montants arrondis à la centaine. */
export function adviceWhy(a: Advice): string {
  return (
    `Pour atteindre « ${a.goalName} » en ${monthLabel(a.targetMonth)}, il faut mettre de côté environ ${formatDA(hundred(a.pace))} par mois. ` +
    `Avec ${formatDA(a.reduction)} de plus, ${a.needed} mois ${a.needed === 1 ? 'suffirait' : 'suffiraient'} au lieu de ${a.months}. ` +
    `Le mois dernier, vos dépenses en ${a.categoryName} ont atteint ${formatDA(hundred(a.lastMonth))}, contre environ ${formatDA(hundred(a.usual))} d'habitude.`
  )
}
