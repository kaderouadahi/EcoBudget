import { Check, Trash2, X } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { categoryIcon } from '../../data/defaults'
import type { Category } from '../../data/model'
import { AMOUNT_HELP, parseAmount, validateDate } from '../../lib/expenses'
import { formatDay } from '../../lib/format'
import { toISODate } from '../../lib/month'
import './ExpenseForm.css'

export interface ExpenseValues {
  amount: number
  categoryId: string
  date: string
  note: string | undefined
}

interface Props {
  categories: Category[]
  /** Catégorie proposée (nouvelle dépense) ; ignorée si `initial` est fourni. */
  proposedId: string
  initial?: { amount: number; categoryId: string; date: string; note?: string }
  today: Date
  title?: string
  submitLabel: string
  onSubmit: (v: ExpenseValues) => void
  onDelete?: () => void
  onClose: () => void
}

/** Formulaire Dépense, partagé par l'ajout et la modification (C6). Aucune lecture de données ici. */
export function ExpenseForm({ categories, proposedId, initial, today, title, submitLabel, onSubmit, onDelete, onClose }: Props) {
  const ids = useId()
  const todayIso = toISODate(today)
  const [amountText, setAmountText] = useState(initial ? String(initial.amount) : '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? proposedId)
  const [date, setDate] = useState(initial?.date ?? todayIso)
  const [note, setNote] = useState(initial?.note ?? '')
  const [errors, setErrors] = useState<{ amount?: string; date?: string }>({})
  const sent = useRef(false)
  const amountRef = useRef<HTMLInputElement>(null)

  const proposedName = categories.find((c) => c.id === proposedId)?.name

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (sent.current) return
    const amount = parseAmount(amountText)
    const dateError = validateDate(date, today)
    const next = { amount: amount.ok ? undefined : amount.error, date: dateError ?? undefined }
    setErrors(next)
    if (!amount.ok) {
      amountRef.current?.focus()
      return
    }
    if (dateError) return
    sent.current = true
    onSubmit({ amount: amount.value, categoryId, date, note: note.trim() || undefined })
  }

  const amountHelpId = `${ids}-amount-help`
  const amountErrId = `${ids}-amount-err`
  const dateErrId = `${ids}-date-err`

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      <div className="expense-form-head">
        <h1>{title ?? 'Nouvelle dépense'}</h1>
        <button type="button" className="icon-button" aria-label="Fermer" onClick={onClose}>
          <X aria-hidden size={24} />
        </button>
      </div>

      <div className={`amount-card${errors.amount ? ' has-error' : ''}`}>
        <label htmlFor={`${ids}-amount`}>Montant</label>
        <div className="amount-row">
          <input
            id={`${ids}-amount`}
            ref={amountRef}
            className="amount-input"
            inputMode="numeric"
            autoComplete="off"
            autoFocus={!initial}
            placeholder="0"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            aria-invalid={errors.amount ? 'true' : 'false'}
            aria-describedby={errors.amount ? `${amountErrId} ${amountHelpId}` : amountHelpId}
          />
          <span className="amount-unit" aria-hidden>DA</span>
        </div>
        {errors.amount && <p id={amountErrId} className="field-error">{errors.amount}</p>}
        <p id={amountHelpId} className="field-help">{AMOUNT_HELP}</p>
      </div>

      <fieldset className="category-field">
        <div className="category-legend-row">
          <legend>Catégorie</legend>
          {!initial && proposedName && <span className="field-help">Proposée : {proposedName}</span>}
        </div>
        <div className="category-grid">
          {categories.map((c) => {
            const Icon = categoryIcon(c.icon)
            return (
              <label key={c.id} className={`category-tile${categoryId === c.id ? ' is-selected' : ''}`}>
                <input
                  type="radio"
                  name={`${ids}-category`}
                  value={c.id}
                  checked={categoryId === c.id}
                  onChange={() => setCategoryId(c.id)}
                />
                <Icon aria-hidden size={24} />
                <span>{c.name}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="expense-form-row">
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
            aria-describedby={errors.date ? dateErrId : undefined}
          />
          {errors.date ? (
            <p id={dateErrId} className="field-error">{errors.date}</p>
          ) : (
            date && <p className="field-help">{formatDay(date, today)}</p>
          )}
        </div>
        <div className="field">
          <label htmlFor={`${ids}-note`}>Note (facultatif)</label>
          <input
            id={`${ids}-note`}
            className="text-input"
            maxLength={60}
            placeholder="Ex. Cafétéria"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="primary-button">
        <Check aria-hidden size={22} />
        {submitLabel}
      </button>
      {onDelete && (
        <button type="button" className="danger-link" onClick={onDelete}>
          <Trash2 aria-hidden size={20} />
          Supprimer la dépense
        </button>
      )}
    </form>
  )
}
