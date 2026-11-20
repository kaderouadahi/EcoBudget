import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/defaults'
import type { Expense } from '../../data/model'

const setUserFields = vi.fn()
let data: Record<string, unknown> = {}
vi.mock('../../auth/AuthGate', () => ({ useUid: () => 'u1' }))
vi.mock('../../data/repo', () => ({
  createDoc: vi.fn(() => 'new-id'),
  removeDoc: vi.fn(),
  setUserFields: (...a: unknown[]) => setUserFields(...a),
}))
vi.mock('../../data/DataProvider', () => ({ useData: () => data }))

import { ToastProvider } from '../../ui/Toast'
import { NewExpense } from './NewExpense'

let nav: (n: number) => void = () => {}
function Where() {
  nav = useNavigate()
  return <p data-testid="where">{useLocation().pathname}</p>
}

const today = new Date()
const iso = (daysAgo: number) => {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const sorties = (n: number): Expense[] =>
  Array.from({ length: n }, (_, i) => ({ id: `s${i}`, amount: 1000, categoryId: 'sorties', date: iso(i + 1), createdAt: i }))

function setup(expenses: Expense[] = [], user: Record<string, unknown> = { onboardingDone: true, alertsEnabled: true }) {
  data = { categories: DEFAULT_CATEGORIES, expenses, budgets: [], user, ready: true }
  render(
    <MemoryRouter initialEntries={['/', '/depense/nouvelle']} initialIndex={1}>
      <ToastProvider>
        <Where />
        <Routes>
          <Route path="/" element={<p>accueil</p>} />
          <Route path="/depense/nouvelle" element={<NewExpense />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  )
}
function addExpense(amount: string, category: string) {
  fireEvent.change(screen.getByLabelText('Montant'), { target: { value: amount } })
  fireEvent.click(screen.getByRole('radio', { name: category }))
  fireEvent.click(screen.getByRole('button', { name: /Enregistrer la dépense/ }))
}
const alertCalls = () => setUserFields.mock.calls.filter((c) => 'alert' in (c[1] as object))

describe('NewExpense', () => {
  beforeEach(() => { setUserFields.mockClear() })

  it('après enregistrement, le bouton retour ne rouvre pas le formulaire (et garde « Annuler »)', () => {
    setup()
    addExpense('250', 'Repas')
    expect(screen.getByTestId('where')).toHaveTextContent('/')
    act(() => nav(-1))
    expect(screen.getByTestId('where')).not.toHaveTextContent('/depense/nouvelle')
  })

  it('dépense inhabituelle : alerte enregistrée avec sa phrase « Pourquoi ? »', () => {
    setup(sorties(5))
    addExpense('4500', 'Sorties')
    expect(alertCalls()).toHaveLength(1)
    const [uid, { alert }] = alertCalls()[0] as [string, { alert: Record<string, unknown> }]
    expect(uid).toBe('u1')
    expect(alert).toMatchObject({ expenseId: 'new-id', amount: 4500, categoryId: 'sorties', date: iso(0), median: 1000, ratio: 4.5, count: 5, oldest: iso(5) })
    expect(String(alert.why).replace(/\s/g, ' ')).toContain("Sorties est d'environ 1 000 DA. Celle-ci est 4,5 fois plus élevée. Calcul fait sur vos 5 dépenses en Sorties")
  })

  it('dépense habituelle : pas d’alerte', () => {
    setup(sorties(5))
    addExpense('1200', 'Sorties')
    expect(alertCalls()).toHaveLength(0)
  })

  it('alertes désactivées : aucun contrôle', () => {
    setup(sorties(5), { onboardingDone: true, alertsEnabled: false })
    addExpense('4500', 'Sorties')
    expect(alertCalls()).toHaveLength(0)
  })
})
