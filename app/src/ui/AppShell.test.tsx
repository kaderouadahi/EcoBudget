import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from '../App'

const LABELS = ['Accueil', 'Budgets', 'Graphiques', 'Objectifs', 'Réglages', 'Ajouter une dépense']

function renderAt(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>)
}

describe('AppShell', () => {
  it('la barre latérale (ordinateur) contient toutes les entrées', () => {
    renderAt('/')
    const sidebar = screen.getByRole('navigation', { name: 'Navigation principale (ordinateur)' })
    for (const label of LABELS) expect(within(sidebar).getByRole('link', { name: label })).toBeInTheDocument()
  })

  it('la barre du bas (téléphone) contient les mêmes entrées, Réglages en haut à droite', () => {
    renderAt('/')
    const bottom = screen.getByRole('navigation', { name: 'Navigation principale (téléphone)' })
    for (const label of ['Accueil', 'Budgets', 'Graphiques', 'Objectifs', 'Ajouter une dépense']) {
      expect(within(bottom).getByRole('link', { name: label })).toBeInTheDocument()
    }
    const top = screen.getByRole('banner')
    expect(within(top).getByRole('link', { name: 'Réglages' })).toBeInTheDocument()
  })

  it('marque la page active', () => {
    renderAt('/budgets')
    const sidebar = screen.getByRole('navigation', { name: 'Navigation principale (ordinateur)' })
    expect(within(sidebar).getByRole('link', { name: 'Budgets' })).toHaveAttribute('aria-current', 'page')
  })

  it('Se connecter et Créer un compte s’affichent sans navigation', () => {
    renderAt('/compte/connexion')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Se connecter' })).toBeInTheDocument()
    renderAt('/compte/creer')
    expect(screen.getByRole('heading', { name: 'Créer un compte' })).toBeInTheDocument()
  })
})
