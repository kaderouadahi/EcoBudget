import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categoryIcon } from '../../data/defaults'
import type { Category, Expense } from '../../data/model'
import { expenseTitle } from '../../lib/expenses'
import { formatDA, formatDay } from '../../lib/format'
import './ExpenseList.css'

/** Liste de Dépenses (Accueil, détail d'un Budget) : toucher une ligne ouvre la modification. */
export function ExpenseList({ label, expenses, categories, today }: {
  label: string
  expenses: Expense[]
  categories: Category[]
  today: Date
}) {
  const byId = new Map(categories.map((c) => [c.id, c]))
  return (
    <ul className="expense-list" aria-label={label}>
      {expenses.map((e) => {
        const c = byId.get(e.categoryId)
        const Icon = categoryIcon(c?.icon)
        return (
          <li key={e.id}>
            <Link to={`/depense/${e.id}`} className="expense-row">
              <span className="expense-icon"><Icon aria-hidden size={20} /></span>
              <span className="expense-text">
                <span className="expense-title">{expenseTitle(e, c)}</span>
                <span className="expense-sub">{c?.name ?? 'Autres'} · {formatDay(e.date, today)}</span>
              </span>
              <span className="expense-amount">{formatDA(-e.amount)}</span>
              <ChevronRight aria-hidden size={18} className="expense-chevron" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
