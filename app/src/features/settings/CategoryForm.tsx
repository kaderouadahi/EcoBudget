import { Check, Plus, X } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { categoryIcon } from '../../data/defaults'
import type { Category } from '../../data/model'
import { CATEGORY_NAME_MAX, defaultIcon, PICKABLE_ICONS, validateCategoryName } from '../../lib/categories'
import '../expenses/ExpenseForm.css'

interface Props {
  categories: Category[]
  /** Modification : la catégorie actuelle. */
  initial?: Category
  onSubmit: (v: { name: string; icon: string }) => void
  onClose: () => void
}

/** Nouvelle catégorie / Modifier la catégorie (H7) : mêmes gestes que Dépense, Budget et Objectif (C6). */
export function CategoryForm({ categories, initial, onSubmit, onClose }: Props) {
  const ids = useId()
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState(defaultIcon(categories, initial?.icon))
  const [error, setError] = useState<string>()
  const sent = useRef(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (sent.current) return
    const problem = validateCategoryName(name, categories, initial?.id)
    setError(problem ?? undefined)
    if (problem) return
    sent.current = true
    onSubmit({ name: name.trim(), icon })
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      <div className="expense-form-head">
        <h1>{initial ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h1>
        <button type="button" className="icon-button" aria-label="Fermer" onClick={onClose}>
          <X aria-hidden size={24} />
        </button>
      </div>

      <div className="field">
        <label htmlFor={`${ids}-name`}>Nom</label>
        <input
          id={`${ids}-name`}
          className="text-input"
          maxLength={CATEGORY_NAME_MAX + 5}
          placeholder="Ex. Enfants"
          autoFocus={!initial}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${ids}-err ${ids}-help` : `${ids}-help`}
        />
        {error && <p id={`${ids}-err`} className="field-error">{error}</p>}
        <p id={`${ids}-help`} className="field-help">{CATEGORY_NAME_MAX} caractères au plus.</p>
      </div>

      <fieldset className="category-field">
        <div className="category-legend-row"><legend>Icône</legend></div>
        <div className="category-grid icon-grid">
          {PICKABLE_ICONS.map((i) => {
            const Icon = categoryIcon(i.key)
            return (
              <label key={i.key} className={`category-tile${icon === i.key ? ' is-selected' : ''}`}>
                <input type="radio" name={`${ids}-icon`} value={i.key} checked={icon === i.key} onChange={() => setIcon(i.key)} aria-label={i.label} />
                <Icon aria-hidden size={24} />
              </label>
            )
          })}
        </div>
      </fieldset>

      <button type="submit" className="primary-button">
        {initial ? <Check aria-hidden size={22} /> : <Plus aria-hidden size={22} />}
        {initial ? 'Enregistrer' : 'Ajouter la catégorie'}
      </button>
    </form>
  )
}
