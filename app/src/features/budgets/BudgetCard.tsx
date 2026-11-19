import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categoryIcon } from '../../data/defaults'
import type { Category } from '../../data/model'
import type { BudgetRow } from '../../lib/budget'
import { formatDA } from '../../lib/format'
import { ProgressBar, StatusChip } from './StatusChip'

export function BudgetCard({ category, row, showPercent = false }: { category: Category; row: BudgetRow; showPercent?: boolean }) {
  const Icon = categoryIcon(category.icon)
  return (
    <Link to={`/budgets/${row.categoryId}`} className="budget-card">
      <span className="budget-card-top">
        <span className="round-icon"><Icon aria-hidden size={22} /></span>
        <span className="budget-card-text">
          <strong>{category.name}</strong>
          <span className="muted">{formatDA(row.spent)} sur {formatDA(row.amount)}{showPercent && ` · ${row.percent} %`}</span>
        </span>
        <ChevronRight aria-hidden size={20} className="muted" />
      </span>
      <ProgressBar kind={row.kind} spent={row.spent} amount={row.amount} percent={row.percent} />
      <StatusChip kind={row.kind} remaining={row.remaining} />
    </Link>
  )
}
