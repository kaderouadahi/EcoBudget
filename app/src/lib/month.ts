// Mois budgétaire : toujours du 1er au dernier jour (DECISIONS.md 18/11).
// Dates stockées en 'YYYY-MM-DD' (date locale), mois en 'YYYY-MM'.

const pad = (n: number) => String(n).padStart(2, '0')

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function monthOf(iso: string): string {
  return iso.slice(0, 7)
}

export function currentMonth(today: Date): string {
  return monthOf(toISODate(today))
}

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number)
  const index = y * 12 + (m - 1) + n
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

/** Jours restants dans le mois, jour courant inclus. */
export function daysLeftInMonth(today: Date): number {
  return daysInMonth(currentMonth(today)) - today.getDate() + 1
}

export function isInMonth(iso: string, month: string): boolean {
  return monthOf(iso) === month
}
