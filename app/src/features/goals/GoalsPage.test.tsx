import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Contribution, Expense, Goal, UserDoc } from '../../data/model'
import { DEFAULT_CATEGORIES } from '../../data/defaults'

let data: Record<string, unknown> = {}
vi.mock('../../auth/AuthGate', () => ({ useUid: () => 'u1' }))
const setUserFields = vi.fn()
vi.mock('../../data/repo', () => ({ createDoc: vi.fn(), removeDoc: vi.fn(), updateDocFields: vi.fn(), setUserFields: (...a: unknown[]) => setUserFields(...a) }))
vi.mock('../../data/DataProvider', () => ({ useData: () => data }))

import { GoalsPage } from './GoalPages'

const norm = (s: string | null) => (s ?? '').replace(/\s/g, ' ')
const month = (offset: number) => {
  const d = new Date(); const t = new Date(d.getFullYear(), d.getMonth() + offset, 1)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`
}
const G = (id: string, name: string, target: number, targetMonth: string, createdAt = 0): Goal => ({ id, name, target, targetMonth, createdAt })
const C = (goalId: string, amount: number): Contribution => ({ id: `${goalId}-${amount}`, goalId, amount, date: '2026-11-01', createdAt: 0 })

function renderPage(goals: Goal[], contributions: Contribution[] = [], expenses: Expense[] = [], user: Partial<UserDoc> = {}) {
  data = { goals, contributions, expenses, categories: DEFAULT_CATEGORIES, user: { alertsEnabled: true, adviceEnabled: true, onboardingDone: true, ...user }, ready: true }
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

describe('carte Conseil (H5)', () => {
  const day = (k: number, d: number) => `${month(-k)}-${String(d).padStart(2, '0')}`
  // Sorties : 5 000, 4 800, 5 200 puis 7 000 le mois dernier (innovation.md §5.2, totaux)
  const expenses: Expense[] = [
    { id: 's4', amount: 5000, categoryId: 'sorties', date: day(4, 10), createdAt: 1 },
    { id: 's3', amount: 4800, categoryId: 'sorties', date: day(3, 10), createdAt: 2 },
    { id: 's2', amount: 5200, categoryId: 'sorties', date: day(2, 10), createdAt: 3 },
    { id: 's1', amount: 7000, categoryId: 'sorties', date: day(1, 10), createdAt: 4 },
  ]
  const goals = [G('pc', 'Ordinateur portable', 150000, month(7), 1), G('res', 'Réserve de sécurité', 50000, month(13), 2)]
  const contributions = [C('pc', 90000), C('res', 12000)]
  const TEXT = 'En réduisant vos sorties de 2 000 DA par mois, vous atteindriez « Ordinateur portable » un mois plus tôt.'

  it('juste sous la carte de l’objectif concerné, bleue, sans couleur de budget', () => {
    setUserFields.mockClear()
    const { container } = renderPage(goals, contributions, expenses)
    const advice = screen.getByRole('region', { name: 'Conseil' })
    expect(norm(advice.textContent)).toContain(TEXT)
    expect(advice.querySelector('svg.lucide-lightbulb')).not.toBeNull()
    const list = container.querySelector('.goal-list')!
    const kids = [...list.children].map((el) => el.getAttribute('aria-label') ?? (el.matches('.alert-card') ? 'Conseil' : '?'))
    expect(kids).toEqual(['Ordinateur portable', 'Conseil', 'Réserve de sécurité'])
    expect(container.querySelector('[class*="status-"]')).toBeNull()
  })

  it('« Pourquoi ? » : phrase et « Gérer les conseils » ; la croix ferme, la carte reste', () => {
    renderPage(goals, contributions, expenses)
    fireEvent.click(screen.getByRole('button', { name: 'Pourquoi ?' }))
    const panel = screen.getByRole('dialog', { name: 'Conseil' })
    expect(norm(panel.textContent)).toContain('il faut mettre de côté environ 8 600 DA par mois. Avec 2 000 DA de plus, 6 mois suffiraient au lieu de 7.')
    expect(norm(panel.textContent)).toContain('vos dépenses en Sorties ont atteint 7 000 DA, contre environ 5 000 DA d\'habitude.')
    expect(within(panel).getByRole('link', { name: 'Gérer les conseils' })).toHaveAttribute('href', '/reglages')
    fireEvent.click(within(panel).getByRole('button', { name: 'Fermer' }))
    expect(screen.getByRole('region', { name: 'Conseil' })).toBeInTheDocument()
  })

  it('« Compris » masque le conseil jusqu’à la fin du mois en cours', () => {
    setUserFields.mockClear()
    renderPage(goals, contributions, expenses)
    fireEvent.click(screen.getByRole('button', { name: 'Compris' }))
    expect(setUserFields).toHaveBeenCalledWith('u1', { adviceHiddenUntil: month(0) })
  })

  it('déjà masqué ce mois-ci : pas de carte', () => {
    renderPage(goals, contributions, expenses, { adviceHiddenUntil: month(0) })
    expect(screen.queryByRole('region', { name: 'Conseil' })).not.toBeInTheDocument()
  })
})
