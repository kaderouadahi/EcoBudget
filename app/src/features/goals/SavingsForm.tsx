import { Check, X } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { AMOUNT_HELP, parseAmount, validateDate } from '../../lib/expenses'
import { formatDA, formatDay } from '../../lib/format'
import { toISODate } from '../../lib/month'
import '../expenses/ExpenseForm.css'
import './goals.css'

interface Props {
  goalName: string
  remaining: number
  today: Date
  onSubmit: (v: { amount: number; date: string }) => void
  onClose: () => void
}

/** Ajouter de l'épargne : même geste que noter une dépense (C2, C6), saisie manuelle adaptée aux espèces (C8). */
export function SavingsForm({ goalName, remaining, today, onSubmit, onClose }: Props) {
  const ids = useId()
  const todayIso = toISODate(today)
  const [amountText, setAmountText] = useState('')
  const [date, setDate] = useState(todayIso)
  const [errors, setErrors] = useState<{ amount?: string; date?: string }>({})
  const sent = useRef(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (sent.current) return
    const amount = parseAmount(amountText)
    const dateError = validateDate(date, today)
    setErrors({ amount: amount.ok ? undefined : amount.error, date: dateError ?? undefined })
    if (!amount.ok || dateError) return
    sent.current = true
    onSubmit({ amount: amount.value, date })
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      <div className="expense-form-head">
        <div>
          <h1>Ajouter de l'épargne</h1>
          <p className="field-help">{goalName}</p>
        </div>
        <button type="button" className="icon-button" aria-label="Fermer" onClick={onClose}>
          <X aria-hidden size={24} />
        </button>
      </div>

      <div className={`amount-card${errors.amount ? ' has-error' : ''}`}>
        <label htmlFor={`${ids}-amount`}>Montant</label>
        <div className="amount-row">
          <input
            id={`${ids}-amount`}
            className="amount-input"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            placeholder="0"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            aria-invalid={errors.amount ? 'true' : 'false'}
            aria-describedby={errors.amount ? `${ids}-err ${ids}-help` : `${ids}-help`}
          />
          <span className="amount-unit" aria-hidden>DA</span>
        </div>
        {errors.amount && <p id={`${ids}-err`} className="field-error">{errors.amount}</p>}
        <p id={`${ids}-help`} className="field-help">
          {remaining > 0 ? `Il reste ${formatDA(remaining)} pour atteindre l'objectif. ` : ''}{AMOUNT_HELP}
        </p>
      </div>

      <div className="field">
        <label htmlFor={`${ids}-date`}>Date</label>
        <input
          id={`${ids}-date`}
          type="date"
          className="text-input"
          max={todayIso}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-invalid={errors.date ? 'true' : 'false'}
          aria-describedby={errors.date ? `${ids}-date-err` : undefined}
        />
        {errors.date ? (
          <p id={`${ids}-date-err`} className="field-error">{errors.date}</p>
        ) : (
          date && <p className="field-help">{formatDay(date, today)}</p>
        )}
      </div>

      <button type="submit" className="primary-button">
        <Check aria-hidden size={22} />
        Ajouter l'épargne
      </button>
    </form>
  )
}
