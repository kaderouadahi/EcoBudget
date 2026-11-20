import { describe, expect, it } from 'vitest'
import type { Expense, UnusualAlert, UserDoc } from '../data/model'
import { cleanFirstName, FIRST_NAME_MAX, shownAlert } from './settings'

describe('cleanFirstName', () => {
  it('espaces de début et de fin retirés', () => {
    expect(cleanFirstName('Yasmine')).toBe('Yasmine')
    expect(cleanFirstName('  Yasmine  ')).toBe('Yasmine')
  })
  it('vide : prénom effacé', () => {
    expect(cleanFirstName('')).toBeUndefined()
    expect(cleanFirstName('   ')).toBeUndefined()
  })
  it(`${30} caractères au plus`, () => {
    expect(FIRST_NAME_MAX).toBe(30)
    expect(cleanFirstName('a'.repeat(40))).toBe('a'.repeat(30))
  })
})

describe('shownAlert', () => {
  const expense: Expense = { id: 'x', amount: 4500, categoryId: 'sorties', date: '2026-11-21', createdAt: 1 }
  const alert: UnusualAlert = { expenseId: 'x', amount: 4500, categoryId: 'sorties', date: '2026-11-21', why: '…' }
  const user = (p: Partial<UserDoc>): UserDoc => ({ alertsEnabled: true, adviceEnabled: true, onboardingDone: true, alert, ...p })

  it('alertes activées : carte affichée', () => {
    expect(shownAlert(user({}), [expense])).toEqual(alert)
  })
  it('alertes désactivées : carte masquée', () => {
    expect(shownAlert(user({ alertsEnabled: false }), [expense])).toBeNull()
  })
  it('réactivées, dépense inchangée : carte revenue ; dépense modifiée : pas de carte', () => {
    expect(shownAlert(user({ alertsEnabled: true }), [expense])).toEqual(alert)
    expect(shownAlert(user({ alertsEnabled: true }), [{ ...expense, amount: 450 }])).toBeNull()
  })
  it('pas de compte encore chargé ou pas d’alerte : rien', () => {
    expect(shownAlert(null, [expense])).toBeNull()
    expect(shownAlert(user({ alert: undefined }), [expense])).toBeNull()
  })
})
