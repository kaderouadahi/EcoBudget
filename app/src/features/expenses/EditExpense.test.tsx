import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/defaults'

const setUserFields = vi.fn()
const today = new Date()
const iso = (daysAgo: number) => {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const expenses = [
  ...Array.from({ length: 5 }, (_, i) => ({ id: `s${i}`, amount: 1000, categoryId: 'sorties', date: iso(i + 1), createdAt: i })),
  { id: 'x', amount: 1000, categoryId: 'sorties', date: iso(0), createdAt: 9 },
]
vi.mock('../../auth/AuthGate', () => ({ useUid: () => 'u1' }))
vi.mock('../../data/repo', () => ({
  createDoc: vi.fn(), removeDoc: vi.fn(), updateDocFields: vi.fn(),
  setUserFields: (...a: unknown[]) => setUserFields(...a),
}))
vi.mock('../../data/DataProvider', () => ({
  useData: () => ({ categories: DEFAULT_CATEGORIES, expenses, budgets: [], user: { onboardingDone: true, alertsEnabled: true }, ready: true }),
}))

import { ToastProvider } from '../../ui/Toast'
import { EditExpense } from './EditExpense'

function ListProbe() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  return <p>liste {pathname}{search} <button type="button" onClick={() => navigate(-1)}>geste retour</button></p>
}
// Ouvert depuis la liste du mois (H10) : la ligne transmet { back } au formulaire.
const fromList = () => render(
  <MemoryRouter initialEntries={[{ pathname: '/depense/x', state: { back: '/depenses?mois=2026-09' } }]}>
    <ToastProvider>
      <Routes>
        <Route path="/depense/:id" element={<EditExpense />} />
        <Route path="/depenses" element={<ListProbe />} />
        <Route path="/" element={<p>accueil</p>} />
      </Routes>
    </ToastProvider>
  </MemoryRouter>,
)

describe('EditExpense', () => {
  it('modifier une dépense ne crée jamais d’alerte, même à 4 500 DA', () => {
    render(
      <MemoryRouter initialEntries={['/depense/x']}>
        <ToastProvider>
          <Routes>
            <Route path="/depense/:id" element={<EditExpense />} />
            <Route path="/" element={<p>accueil</p>} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText('Montant'), { target: { value: '4500' } })
    fireEvent.click(screen.getByRole('button', { name: /^Enregistrer$/ }))
    expect(screen.getByText('accueil')).toBeInTheDocument()
    expect(setUserFields).not.toHaveBeenCalled()
  })

  it('ouvert depuis la liste du mois : « Enregistrer » revient sur la liste du même mois, avec le message et « Annuler »', () => {
    fromList()
    fireEvent.change(screen.getByLabelText('Montant'), { target: { value: '1200' } })
    fireEvent.click(screen.getByRole('button', { name: /^Enregistrer$/ }))
    expect(screen.getByText('liste /depenses?mois=2026-09')).toBeInTheDocument()
    expect(screen.getByText(/^Dépense modifiée/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument()
  })

  it('ouvert depuis la liste du mois : la suppression revient sur la liste du même mois, avec « Annuler »', () => {
    fromList()
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer la dépense' }))
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
    expect(screen.getByText('liste /depenses?mois=2026-09')).toBeInTheDocument()
    expect(screen.getByText(/^Dépense supprimée/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument()
  })

  it('historique : après « Enregistrer » depuis la liste, le geste retour mène à l’Accueil (pas une seconde fois à la liste)', () => {
    render(
      <MemoryRouter initialEntries={['/', '/depenses?mois=2026-09', { pathname: '/depense/x', state: { back: '/depenses?mois=2026-09' } }]} initialIndex={2}>
        <ToastProvider>
          <Routes>
            <Route path="/depense/:id" element={<EditExpense />} />
            <Route path="/depenses" element={<ListProbe />} />
            <Route path="/" element={<p>accueil</p>} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /^Enregistrer$/ }))
    expect(screen.getByText(/^liste \/depenses\?mois=2026-09/)).toBeInTheDocument()
    expect(screen.getByText(/^Dépense modifiée/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'geste retour' }))
    expect(screen.getByText('accueil')).toBeInTheDocument()
  })
})
