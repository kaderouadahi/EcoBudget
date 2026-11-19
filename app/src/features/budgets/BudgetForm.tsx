import { Check, Trash2, X } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import type { Category } from '../../data/model'
import { parseAmount } from '../../lib/expenses'
import '../expenses/ExpenseForm.css'

export const BUDGET_HELP = 'Budget reconduit chaque mois. Vous pouvez le changer à tout moment.'

interface Props {
  /** Catégories sans budget (création). */
  choices: Category[]
  initialCategoryId?: string
  /** Modification : la catégorie ne change pas. */
  fixedCategory?: Category
  initialAmount?: number
  onSubmit: (v: { categoryId: string; amount: number }) => void
  onRemove?: () => void
  onClose: () => void
}

/** Budget mensuel d'une Catégorie, facultatif, reconduit (C4). Mêmes règles de montant qu'une Dépense (C6). */
export function BudgetForm({ choices, initialCategoryId, fixedCategory, initialAmount, onSubmit, onRemove, onClose }: Props) {
  const ids = useId()
  const [categoryId, setCategoryId] = useState(fixedCategory?.id ?? initialCategoryId ?? choices[0]?.id ?? '')
  const [amountText, setAmountText] = useState(initialAmount ? String(initialAmount) : '')
  const [error, setError] = useState<string>()
  const sent = useRef(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (sent.current) return
    const amount = parseAmount(amountText)
    if (!amount.ok) {
      setError(amount.error)
      return
    }
    sent.current = true
    onSubmit({ categoryId, amount: amount.value })
  }

  const errId = `${ids}-err`
  const helpId = `${ids}-help`
  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      <div className="expense-form-head">
        <h1>{fixedCategory ? `Modifier le budget ${fixedCategory.name}` : 'Fixer un budget'}</h1>
        <button type="button" className="icon-button" aria-label="Fermer" onClick={onClose}>
          <X aria-hidden size={24} />
        </button>
      </div>

      {!fixedCategory && (
        <div className="field">
          <label htmlFor={`${ids}-cat`}>Catégorie</label>
          <select id={`${ids}-cat`} className="text-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {choices.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <div className={`amount-card${error ? ' has-error' : ''}`}>
        <label htmlFor={`${ids}-amount`}>Montant mensuel</label>
        <div className="amount-row">
          <input
            id={`${ids}-amount`}
            className="amount-input"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${errId} ${helpId}` : helpId}
          />
          <span className="amount-unit" aria-hidden>DA</span>
        </div>
        {error && <p id={errId} className="field-error">{error}</p>}
        <p id={helpId} className="field-help">{BUDGET_HELP}</p>
      </div>

      <button type="submit" className="primary-button">
        <Check aria-hidden size={22} />
        Enregistrer le budget
      </button>
      {onRemove && (
        <button type="button" className="danger-link" onClick={onRemove}>
          <Trash2 aria-hidden size={20} />
          Retirer le budget
        </button>
      )}
    </form>
  )
}
