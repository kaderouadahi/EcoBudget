import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/defaults'

const setUserFields = vi.fn()
let data: Record<string, unknown> = {}
vi.mock('../../auth/AuthGate', () => ({ useUid: () => 'u1' }))
vi.mock('../../data/repo', () => ({
  createDoc: vi.fn(), removeDoc: vi.fn(), updateDocFields: vi.fn(),
  setUserFields: (...a: unknown[]) => setUserFields(...a),
}))
vi.mock('../../data/DataProvider', () => ({ useData: () => data }))

import { ToastProvider } from '../../ui/Toast'
import { BudgetDetail, OffBudgetList, SetBudget } from './BudgetPages'
import { budgetSummary } from '../../lib/budget'

const base = { categories: DEFAULT_CATEGORIES, expenses: [], budgets: [], ready: true }

describe('Hors budget', () => {
  it('chaque ligne porte l’icône de sa catégorie (pas le cœur de Santé)', () => {
    const expenses = [{ id: 'e', amount: 50, categoryId: 'transport', date: '2026-11-10', createdAt: 0 }]
    const summary = budgetSummary([], DEFAULT_CATEGORIES, expenses, '2026-11')
    const { container } = render(<OffBudgetList summary={summary} categories={DEFAULT_CATEGORIES} />)
    expect(container.querySelector('svg.lucide-bus-front')).not.toBeNull()
    expect(container.querySelector('svg.lucide-heart')).toBeNull()
  })
})

describe('pages Budget', () => {
  beforeEach(() => { setUserFields.mockClear() })

  it('budget fixé depuis la première ouverture : la bienvenue laisse place à l’Accueil', () => {
    data = { ...base, user: { onboardingDone: false } }
    render(
      <MemoryRouter initialEntries={['/budgets/fixer']}>
        <ToastProvider>
          <Routes>
            <Route path="/budgets/fixer" element={<SetBudget />} />
            <Route path="/budgets" element={<p>liste</p>} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText('Montant mensuel'), { target: { value: '10000' } })
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer le budget/ }))
    expect(setUserFields).toHaveBeenCalledWith('u1', { onboardingDone: true })
  })

  it('détail d’un budget retiré : retour à la liste au lieu d’une page vide', () => {
    data = { ...base, user: { onboardingDone: true } }
    render(
      <MemoryRouter initialEntries={['/budgets/courses']}>
        <Routes>
          <Route path="/budgets/:categoryId" element={<BudgetDetail />} />
          <Route path="/budgets" element={<p>liste des budgets</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('liste des budgets')).toBeInTheDocument()
  })
})
