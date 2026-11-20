import type { Expense, UnusualAlert, UserDoc } from '../data/model'
import { visibleAlert } from './alert'

// Réglages (HANDOFF H7, DECISIONS.md 17/11 et 20/11).

/** Longueur maximale du prénom (choix, noté dans les écarts de H7). */
export const FIRST_NAME_MAX = 30

/** Prénom saisi : espaces de début et de fin retirés, 30 caractères au plus ; vide → effacé. */
export function cleanFirstName(text: string): string | undefined {
  const t = text.trim().slice(0, FIRST_NAME_MAX).trim()
  return t === '' ? undefined : t
}

/** Carte d'alerte affichée : aucune si les alertes sont désactivées ; sinon règle de H3 (dépense inchangée). */
export function shownAlert(user: UserDoc | null, expenses: Expense[]): UnusualAlert | null {
  if (!user || user.alertsEnabled === false) return null
  return visibleAlert(user.alert, expenses)
}
