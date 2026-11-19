import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/defaults'

vi.mock('../../auth/AuthGate', () => ({ useUid: () => 'u1' }))
vi.mock('../../data/repo', () => ({ createDoc: vi.fn(() => 'new-id'), removeDoc: vi.fn(), setUserFields: vi.fn() }))
vi.mock('../../data/DataProvider', () => ({
  useData: () => ({ categories: DEFAULT_CATEGORIES, expenses: [], budgets: [], user: { onboardingDone: true }, ready: true }),
}))

import { ToastProvider } from '../../ui/Toast'
import { NewExpense } from './NewExpense'

let nav: (n: number) => void = () => {}
function Where() {
  nav = useNavigate()
  return <p data-testid="where">{useLocation().pathname}</p>
}

describe('NewExpense', () => {
  it('après enregistrement, le bouton retour ne rouvre pas le formulaire (et garde « Annuler »)', () => {
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
    fireEvent.change(screen.getByLabelText('Montant'), { target: { value: '250' } })
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer la dépense/ }))
    expect(screen.getByTestId('where')).toHaveTextContent('/')
    act(() => nav(-1))
    expect(screen.getByTestId('where')).not.toHaveTextContent('/depense/nouvelle')
  })
})
