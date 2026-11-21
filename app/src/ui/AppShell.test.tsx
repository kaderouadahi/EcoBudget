import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './AppShell'
import { describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '../App'
import { ToastProvider } from './Toast'

// Écrans de compte réels (H9) : compte anonyme, appareil sans dépense, Firebase jamais appelé.
vi.mock('../auth/AuthGate', () => ({ useUid: () => 'u1', useAccount: () => ({ uid: 'u1', email: null, isAnonymous: true, refresh: () => {} }) }))
vi.mock('../auth/actions', () => ({}))
vi.mock('../data/repo', () => ({}))
vi.mock('../data/DataProvider', () => ({ useData: () => ({ user: null, expenses: [], categories: [], budgets: [], goals: [], contributions: [], ready: true }) }))

const LABELS = ['Accueil', 'Budgets', 'Graphiques', 'Objectifs', 'Réglages', 'Ajouter une dépense']

// Coquille seule : les pages ont besoin des données, on les remplace par une page factice.
function renderAt(path: string) {
  if (path.startsWith('/compte')) return render(<MemoryRouter initialEntries={[path]}><ToastProvider><AppRoutes /></ToastProvider></MemoryRouter>)
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route element={<AppShell />}><Route path="*" element={<p>page</p>} /></Route></Routes>
    </MemoryRouter>,
  )
}

describe('AppShell', () => {
  it('la barre latérale (ordinateur) contient toutes les entrées', () => {
    renderAt('/reglages')
    const sidebar = screen.getByRole('navigation', { name: 'Navigation principale (ordinateur)' })
    for (const label of LABELS) expect(within(sidebar).getByRole('link', { name: label })).toBeInTheDocument()
  })

  it('la barre du bas (téléphone) contient les mêmes entrées, Réglages en haut à droite', () => {
    renderAt('/reglages')
    const bottom = screen.getByRole('navigation', { name: 'Navigation principale (téléphone)' })
    for (const label of ['Accueil', 'Budgets', 'Graphiques', 'Objectifs', 'Ajouter une dépense']) {
      expect(within(bottom).getByRole('link', { name: label })).toBeInTheDocument()
    }
    const top = screen.getByRole('banner')
    expect(within(top).getByRole('link', { name: 'Réglages' })).toBeInTheDocument()
  })

  it('formulaire Dépense : pas de barre du bas (elle masquerait ses boutons)', () => {
    render(
      <MemoryRouter initialEntries={['/depense/nouvelle']}>
        <Routes><Route element={<AppShell />}><Route path="depense/nouvelle" element={<p>formulaire</p>} /></Route></Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('formulaire')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Navigation principale (téléphone)' })).not.toBeInTheDocument()
  })

  it('liste des Dépenses (H10) : écran « Dépenses » avec la barre du bas', () => {
    render(<MemoryRouter initialEntries={['/depenses']}><ToastProvider><AppRoutes /></ToastProvider></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Dépenses' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Navigation principale (téléphone)' })).toBeInTheDocument()
  })

  it('marque la page active', () => {
    renderAt('/reglages')
    const sidebar = screen.getByRole('navigation', { name: 'Navigation principale (ordinateur)' })
    expect(within(sidebar).getByRole('link', { name: 'Réglages' })).toHaveAttribute('aria-current', 'page')
  })

  it('Se connecter et Créer un compte s’affichent sans navigation', () => {
    renderAt('/compte/connexion')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Se connecter' })).toBeInTheDocument()
    renderAt('/compte/creer')
    expect(screen.getByRole('heading', { name: 'Créer un compte' })).toBeInTheDocument()
  })
})
