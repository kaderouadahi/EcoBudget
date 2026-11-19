import { Check, CircleAlert, TriangleAlert } from 'lucide-react'
import type { BudgetKind } from '../../lib/budget'
import { formatDA } from '../../lib/format'
import './budgets.css'

/** État d'un Budget : toujours couleur + icône + texte, sans reproche (C7, DECISIONS.md 17/11). */
export function StatusChip({ kind, remaining }: { kind: BudgetKind; remaining: number }) {
  const Icon = kind === 'ok' ? Check : kind === 'warn' ? TriangleAlert : CircleAlert
  const text = kind === 'ok' ? 'Dans le budget' : kind === 'warn' ? `Il reste ${formatDA(remaining)}` : `Dépassé de ${formatDA(-remaining)}`
  return (
    <span className={`status-chip status-${kind}`}>
      <Icon data-testid="status-icon" aria-hidden size={17} />
      {text}
    </span>
  )
}

export function ProgressBar({ kind, spent, amount, percent }: { kind: BudgetKind; spent: number; amount: number; percent: number }) {
  const ratio = amount > 0 ? Math.min(1, spent / amount) : 0
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${percent} %`}
    >
      <div className={`progress-fill status-fill-${kind}`} style={{ width: `${ratio * 100}%` }} />
    </div>
  )
}
