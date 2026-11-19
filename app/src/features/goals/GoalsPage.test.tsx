import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Contribution, Goal } from '../../data/model'

let data: Record<string, unknown> = {}
vi.mock('../../auth/AuthGate', () => ({ useUid: () => 'u1' }))
vi.mock('../../data/repo', () => ({ createDoc: vi.fn(), removeDoc: vi.fn(), updateDocFields: vi.fn() }))
vi.mock('../../data/DataProvider', () => ({ useData: () => data }))

import { GoalsPage } from './GoalPages'

const norm = (s: string | null) => (s ?? '').replace(/\s/g, ' ')
const month = (offset: number) => {
  const d = new Date(); const t = new Date(d.getFullYear(), d.getMonth() + offset, 1)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`
}
const G = (id: string, name: string, target: number, targetMonth: string, createdAt = 0): Goal => ({ id, name, target, targetMonth, createdAt })
const C = (goalId: string, amount: number): Contribution => ({ id: `${goalId}-${amount}`, goalId, amount, date: '2026-11-01', createdAt: 0 })

function renderPage(goals: Goal[], contributions: Contribution[] = []) {
  data = { goals, contributions, ready: true }
  return render(<MemoryRouter><GoalsPage /></MemoryRouter>)
}

describe('Objectifs', () => {
  it('écran vide', () => {
    renderPage([])
    expect(screen.getByRole('heading', { name: 'Objectifs' })).toBeInTheDocument()
    expect(screen.getByText('Votre épargne')).toBeInTheDocument()
    expect(screen.getByText("Pas encore d'objectif d'épargne")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Créer un objectif' })).toHaveAttribute('href', '/objectifs/nouveau')
  })

  it('carte en cours : 60 %, étape 50 %, montants, ajout d’épargne, barre bleue', () => {
    const { container } = renderPage([G('pc', 'Ordinateur portable', 150000, month(7))], [C('pc', 60000), C('pc', 30000)])
    const card = screen.getByRole('article', { name: 'Ordinateur portable' })
    expect(norm(card.textContent)).toContain('60 %')
    expect(norm(card.textContent)).toContain('90 000 DA épargnés sur 150 000 DA')
    expect(norm(card.textContent)).toContain('Étape franchie : vous avez passé les 50 % !')
    expect(card.querySelector('svg.lucide-trophy')).not.toBeNull()
    expect(within(card).getByRole('link', { name: 'Ajouter de l’épargne à Ordinateur portable' })).toHaveAttribute('href', '/objectifs/pc/epargne')
    expect(within(card).getByRole('link', { name: 'Modifier l’objectif Ordinateur portable' })).toHaveAttribute('href', '/objectifs/pc')
    expect(within(card).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60')
    expect(container.querySelector('[class*="status-"]')).toBeNull()
  })

  it('objectif atteint : icône + texte, pas de bouton d’ajout, en bas de la liste', () => {
    renderPage([G('done', 'Vélo', 20000, month(2)), G('far', 'Voyage', 90000, month(12))], [C('done', 25000)])
    const cards = screen.getAllByRole('article')
    expect(cards.map((c) => c.getAttribute('aria-label'))).toEqual(['Voyage', 'Vélo'])
    const done = cards[1]
    expect(norm(done.textContent)).toContain('Objectif atteint !')
    expect(norm(done.textContent)).toContain('100 %')
    expect(done.querySelector('svg.lucide-circle-check')).not.toBeNull()
    expect(within(done).queryByRole('link', { name: /Ajouter de l’épargne/ })).not.toBeInTheDocument()
  })

  it('date visée passée : icône + texte neutre et lien « Modifier la date »', () => {
    renderPage([G('late', 'Moto', 100000, month(-1))], [C('late', 10000)])
    const card = screen.getByRole('article', { name: 'Moto' })
    expect(norm(card.textContent)).toContain('Date visée passée')
    expect(card.querySelector('svg.lucide-calendar-clock')).not.toBeNull()
    expect(within(card).getByRole('link', { name: 'Modifier la date' })).toHaveAttribute('href', '/objectifs/late')
  })

  it('tri : le plus proche en haut', () => {
    renderPage([G('b', 'B', 1000, month(9)), G('a', 'A', 1000, month(3)), G('c', 'C', 1000, month(5))])
    expect(screen.getAllByRole('article').map((c) => c.getAttribute('aria-label'))).toEqual(['A', 'C', 'B'])
  })
})
