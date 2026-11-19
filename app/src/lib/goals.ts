import type { Contribution, Goal } from '../data/model'
import { parseAmount, type AmountResult } from './expenses'
import { monthName } from './format'
import { addMonths, currentMonth } from './month'

// Objectifs d'épargne (HANDOFF H4, DECISIONS.md 18/11 et 19/11).
// Montant épargné = somme des versements (corrections comprises), jamais stocké à part.

export type GoalStatus = 'ongoing' | 'late' | 'reached'

export function savedAmount(goalId: string, contributions: Contribution[]): number {
  return contributions.reduce((sum, c) => (c.goalId === goalId ? sum + c.amount : sum), 0)
}

/** Arrondi vers le bas ; jamais 100 % tant que l'objectif n'est pas atteint ; plafonné à 100 %. */
export function goalPercent(saved: number, target: number): number {
  if (target <= 0 || saved >= target) return 100
  return Math.min(99, Math.max(0, Math.floor((saved * 100) / target)))
}

/** Plus haute étape (25, 50, 75 %) atteinte sous 100 %. */
export function milestone(percent: number): 25 | 50 | 75 | null {
  if (percent >= 100) return null
  if (percent >= 75) return 75
  if (percent >= 50) return 50
  if (percent >= 25) return 25
  return null
}

export function goalStatus(saved: number, target: number, targetMonth: string, month: string): GoalStatus {
  if (saved >= target) return 'reached'
  return targetMonth < month ? 'late' : 'ongoing'
}

/** En cours (date passée comprise) par mois visé puis création ; atteints en bas, même ordre. */
export function sortGoals<T extends { goal: Goal; status: GoalStatus }>(items: T[]): T[] {
  const byDate = (a: T, b: T) => a.goal.targetMonth.localeCompare(b.goal.targetMonth) || a.goal.createdAt - b.goal.createdAt
  return [...items].sort((a, b) => Number(a.status === 'reached') - Number(b.status === 'reached') || byDate(a, b))
}

/** Montant épargné saisi en modification : entier ≥ 0. */
export function parseSaved(text: string): AmountResult {
  if (/^\s*0+\s*$/.test(text)) return { ok: true, value: 0 }
  if (/^\s*-\s*\d/.test(text)) return { ok: false, error: 'Le montant épargné ne peut pas être négatif, par exemple 0' }
  return parseAmount(text)
}

/** Versement de correction (différence) ; 0 = rien à enregistrer. */
export function correction(oldSaved: number, newSaved: number): number {
  return newSaved - oldSaved
}

export function nextMonth(today: Date): string {
  return addMonths(currentMonth(today), 1)
}

/** « juin 2027 » */
export function monthLabel(month: string): string {
  return `${monthName(month)} ${month.slice(0, 4)}`
}

/** Au plus tôt le mois prochain ; en modification, contrôle seulement si la date change. */
export function validateTargetMonth(month: string, today: Date, original?: string): string | null {
  if (!month) return 'Choisissez une date visée'
  if (original && month === original) return null
  const min = nextMonth(today)
  return month < min ? `Choisissez un mois à partir de ${monthLabel(min)}` : null
}

/** Ajout au message après un versement : nouvelle étape franchie ou objectif atteint. */
export function progressNotice(beforeSaved: number, afterSaved: number, target: number): string | null {
  const before = goalPercent(beforeSaved, target)
  const after = goalPercent(afterSaved, target)
  if (after === 100 && before < 100) return 'Objectif atteint !'
  const m = milestone(after)
  return m && m !== milestone(before) && (milestone(before) ?? 0) < m ? `Étape franchie : ${m} % !` : null
}
