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
