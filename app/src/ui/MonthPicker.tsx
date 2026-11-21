import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthTitle } from '../lib/format'
import './MonthPicker.css'

/**
 * Sélecteur de mois commun à Graphiques (H6) et à la liste des Dépenses (H10) : mêmes flèches,
 * même « en cours », mêmes libellés (C6). Flèches grisées et inactives aux deux bouts.
 */
export function MonthPicker({ months, value, current, label, onChange }: {
  months: string[]
  value: string
  current: string
  /** Nom du groupe pour les lecteurs d'écran (« Mois détaillé », « Mois affiché »). */
  label: string
  onChange: (month: string) => void
}) {
  const index = months.indexOf(value)
  const isCurrent = value === current
  return (
    <div className="month-picker" role="group" aria-label={label}>
      <button type="button" className="month-arrow" aria-label="Mois précédent" disabled={index <= 0} onClick={() => onChange(months[index - 1])}>
        <ChevronLeft aria-hidden size={22} />
      </button>
      <span className="month-picker-label" aria-live="polite">
        {formatMonthTitle(value)}{' '}
        {/* Place toujours réservée : les flèches ne bougent pas d'un mois à l'autre. */}
        <span className={isCurrent ? 'month-current' : 'month-current is-hidden'} aria-hidden={!isCurrent}>en cours</span>
      </span>
      <button type="button" className="month-arrow" aria-label="Mois suivant" disabled={index >= months.length - 1} onClick={() => onChange(months[index + 1])}>
        <ChevronRight aria-hidden size={22} />
      </button>
    </div>
  )
}
