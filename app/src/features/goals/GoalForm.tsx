import { Check, Plus, Trash2, X } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { parseAmount } from '../../lib/expenses'
import { monthLabel, nextMonth, parseSaved, validateTargetMonth } from '../../lib/goals'
import '../expenses/ExpenseForm.css'
import './goals.css'

export interface GoalValues {
  name: string
  target: number
  targetMonth: string
  /** Modification seulement : nouveau montant épargné. */
  saved?: number
}

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

interface Props {
  initial?: { name: string; target: number; targetMonth: string }
  initialSaved?: number
  today: Date
  onSubmit: (v: GoalValues) => void
  onDelete?: () => void
  onClose: () => void
}

/** Objectif d'épargne en trois champs (C2) ; mêmes règles de montant que Dépense et Budget (C6). */
export function GoalForm({ initial, initialSaved, today, onSubmit, onDelete, onClose }: Props) {
  const ids = useId()
  const editing = !!initial
  const [name, setName] = useState(initial?.name ?? '')
  const [targetText, setTargetText] = useState(initial ? String(initial.target) : '')
  const [month, setMonth] = useState(initial?.targetMonth.slice(5, 7) ?? '')
  const [year, setYear] = useState(initial?.targetMonth.slice(0, 4) ?? '')
  const [savedText, setSavedText] = useState(initialSaved !== undefined ? String(initialSaved) : '')
  const [errors, setErrors] = useState<{ name?: string; target?: string; date?: string; saved?: string }>({})
  const sent = useRef(false)

  const thisYear = today.getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => String(thisYear + i))
  if (initial && !years.includes(initial.targetMonth.slice(0, 4))) years.unshift(initial.targetMonth.slice(0, 4))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (sent.current) return
    const target = parseAmount(targetText)
    // Partiel (« 2027- » ou « -06 ») : l'erreur dit ce qui manque.
    const targetMonth = month || year ? `${year}-${month}` : ''
    const saved = editing ? parseSaved(savedText) : null
    const next = {
      name: name.trim() ? undefined : 'Donnez un nom à votre objectif, par exemple Ordinateur portable',
      target: target.ok ? undefined : target.error,
      date: validateTargetMonth(targetMonth, today, initial?.targetMonth) ?? undefined,
      saved: saved && !saved.ok ? saved.error : undefined,
    }
    setErrors(next)
    if (next.name || next.target || next.date || next.saved || !target.ok) return
    sent.current = true
    onSubmit({
      name: name.trim(),
      target: target.value,
      targetMonth,
      ...(saved?.ok ? { saved: saved.value } : {}),
    })
  }

  const err = (k: keyof typeof errors) => (errors[k] ? `${ids}-${k}-err` : undefined)
  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      <div className="expense-form-head">
        <h1>{editing ? "Modifier l'objectif" : 'Nouvel objectif'}</h1>
        <button type="button" className="icon-button" aria-label="Fermer" onClick={onClose}>
          <X aria-hidden size={24} />
        </button>
      </div>

      <div className="field">
        <label htmlFor={`${ids}-name`}>Nom</label>
        <input
          id={`${ids}-name`}
          className="text-input"
          maxLength={60}
          placeholder="Ex. Ordinateur portable"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={err('name')}
        />
        {errors.name && <p id={err('name')} className="field-error">{errors.name}</p>}
      </div>

      <div className="field">
        <label htmlFor={`${ids}-target`}>Montant à atteindre</label>
        <div className="input-with-unit">
          <input
            id={`${ids}-target`}
            className="text-input"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ex. 150 000"
            value={targetText}
            onChange={(e) => setTargetText(e.target.value)}
            aria-invalid={errors.target ? 'true' : 'false'}
            aria-describedby={err('target')}
          />
          <span aria-hidden>DA</span>
        </div>
        {errors.target && <p id={err('target')} className="field-error">{errors.target}</p>}
      </div>

      <fieldset className="field date-fieldset" aria-describedby={`${ids}-date-help`}>
        <legend>Date visée</legend>
        <div className="month-year">
          <select
            className="text-input"
            aria-label="Mois visé"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-invalid={errors.date ? 'true' : 'false'}
            aria-describedby={err('date')}
          >
            <option value="">Mois</option>
            {MONTHS.map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
          </select>
          <select
            className="text-input"
            aria-label="Année visée"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            aria-invalid={errors.date ? 'true' : 'false'}
            aria-describedby={err('date')}
          >
            <option value="">Année</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {errors.date && <p id={err('date')} className="field-error">{errors.date}</p>}
        <p id={`${ids}-date-help`} className="field-help">Au plus tôt {monthLabel(nextMonth(today))}</p>
      </fieldset>

      {editing && (
        <div className="field">
          <label htmlFor={`${ids}-saved`}>Montant épargné</label>
          <div className="input-with-unit">
            <input
              id={`${ids}-saved`}
              className="text-input"
              inputMode="numeric"
              autoComplete="off"
              value={savedText}
              onChange={(e) => setSavedText(e.target.value)}
              aria-invalid={errors.saved ? 'true' : 'false'}
              aria-describedby={errors.saved ? `${err('saved')} ${ids}-saved-help` : `${ids}-saved-help`}
            />
            <span aria-hidden>DA</span>
          </div>
          {errors.saved && <p id={err('saved')} className="field-error">{errors.saved}</p>}
          <p id={`${ids}-saved-help`} className="field-help">Pour corriger une erreur. Pour une nouvelle épargne, utilisez « Ajouter de l'épargne ».</p>
        </div>
      )}

      <button type="submit" className="primary-button">
        {editing ? <Check aria-hidden size={22} /> : <Plus aria-hidden size={22} />}
        {editing ? 'Enregistrer' : "Créer l'objectif"}
      </button>
      {onDelete && (
        <button type="button" className="danger-link" onClick={onDelete}>
          <Trash2 aria-hidden size={20} />
          Supprimer l'objectif
        </button>
      )}
    </form>
  )
}
