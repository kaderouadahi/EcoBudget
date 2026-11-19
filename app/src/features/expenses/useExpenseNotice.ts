import { budgetNotice } from '../../lib/budget'
import { currentMonth, isInMonth } from '../../lib/month'
import type { Budget, Expense } from '../../data/model'

/** État du Budget de la catégorie après ajout d'une Dépense, ou null (sous 80 %, pas de budget, autre mois). */
export function noticeAfterAdd(
  expenses: Expense[],
  budgets: Budget[],
  added: { amount: number; categoryId: string; date: string },
  categoryName: string,
  today: Date,
) {
  const month = currentMonth(today)
  const budget = budgets.find((b) => b.id === added.categoryId)
  if (!budget || !isInMonth(added.date, month)) return null
  const before = expenses
    .filter((e) => e.categoryId === added.categoryId && isInMonth(e.date, month))
    .reduce((sum, e) => sum + e.amount, 0)
  return budgetNotice(categoryName, before + added.amount, budget.amount)
}
