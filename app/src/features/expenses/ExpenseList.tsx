import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categoryIcon } from '../../data/defaults'
import type { Category, Expense } from '../../data/model'
import { expenseTitle } from '../../lib/expenses'
import { formatDA, formatDay } from '../../lib/format'
import './ExpenseList.css'

/** Liste de Dépenses (Accueil, détail d'un Budget, Dépenses du mois) : toucher une ligne ouvre la modification. */
export function ExpenseList({ label, expenses, categories, today, showDay = true, linkState }: {
  label: string
  expenses: Expense[]
  categories: Category[]
  today: Date
  /** Faux dans la liste du mois (H10) : le jour est déjà dans l'intertitre, le sous-titre est la catégorie seule. */
  showDay?: boolean
  /** Transmis au formulaire de modification (H10 : `{ back }`, où revenir après « Enregistrer »). */
  linkState?: unknown
}) {
  const byId = new Map(categories.map((c) => [c.id, c]))
  return (
    <ul className="expense-list" aria-label={label}>
      {expenses.map((e) => {
        const c = byId.get(e.categoryId)
        const Icon = categoryIcon(c?.icon)
        return (
          <li key={e.id}>
            <Link to={`/depense/${e.id}`} state={linkState} className="expense-row">
              <span className="expense-icon"><Icon aria-hidden size={20} /></span>
              <span className="expense-text">
                <span className="expense-title">{expenseTitle(e, c)}</span>
                <span className="expense-sub">{c?.name ?? 'Autres'}{showDay && ` · ${formatDay(e.date, today)}`}</span>
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
