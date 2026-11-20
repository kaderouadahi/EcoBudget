import { parseISODate } from './month'

// Formats d'affichage communs (HANDOFF H0) : seuls ces helpers servent à afficher montants et dates.
// Milliers séparés par une espace insécable normale : l'espace fine est presque invisible dans la police.
const NBSP = ' '
const MINUS = '−'

/** « 44 000 » : montant sans unité (au-dessus des barres, avec « Montants en DA » une seule fois). */
export function formatNumber(amount: number): string {
  if (!Number.isFinite(amount)) return '\u2014'
  const abs = Math.round(Math.abs(amount))
  const digits = String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
  return `${amount < 0 && abs !== 0 ? MINUS : ''}${digits}`
}

/** « 34 000 DA », « −250 DA ». Montants entiers en dinars. */
export function formatDA(amount: number): string {
  if (!Number.isFinite(amount)) return `\u2014${NBSP}DA`
  return `${formatNumber(amount)}${NBSP}DA`
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' })
const longDate = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
const longDateYear = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const monthYear = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
const monthOnly = new Intl.DateTimeFormat('fr-FR', { month: 'long' })

const DAY_MS = 86_400_000

/** « Aujourd'hui », « Hier », « Samedi » (2 à 6 jours), sinon « samedi 14 novembre ». */
export function formatDay(iso: string, today: Date): string {
  const date = parseISODate(iso)
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diff = Math.round((start.getTime() - date.getTime()) / DAY_MS)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff >= 2 && diff <= 6) return capitalize(weekday.format(date))
  const text = (date.getFullYear() === today.getFullYear() ? longDate : longDateYear).format(date)
  // « 1er novembre » : usage français pour le premier jour du mois.
  return date.getDate() === 1 ? text.replace(/(^|\s)1(\s)/, '$11er$2') : text
}

/** « Novembre 2026 » */
export function formatMonthTitle(month: string): string {
  return capitalize(monthYear.format(parseISODate(`${month}-01`)))
}

/** « novembre » */
export function monthName(month: string): string {
  return monthOnly.format(parseISODate(`${month}-01`))
}
