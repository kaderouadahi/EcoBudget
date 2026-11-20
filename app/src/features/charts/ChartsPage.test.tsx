import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/defaults'
import type { Expense } from '../../data/model'
import { buildDemoData } from '../../lib/demo'
import { formatMonthTitle } from '../../lib/format'
import { addMonths, currentMonth } from '../../lib/month'

let data: Record<string, unknown> = {}
vi.mock('../../data/DataProvider', () => ({ useData: () => data }))

import { ChartsPage } from './ChartsPage'

const today = new Date()
const M = currentMonth(today)
const norm = (s: string | null) => (s ?? '').replace(/\s/g, ' ')
const demo = buildDemoData(today)
const setData = (expenses: Expense[], ready = true) => { data = { expenses, categories: DEFAULT_CATEGORIES, ready } }
const renderPage = () => render(<MemoryRouter><ChartsPage /></MemoryRouter>)
const prev = () => screen.getByRole('button', { name: 'Mois précédent' })
const next = () => screen.getByRole('button', { name: 'Mois suivant' })
const picker = () => screen.getByRole('group', { name: 'Mois détaillé' })
const legend = () => screen.getByRole('list', { name: 'Répartition par catégorie' })
const barsTable = () => screen.getByRole('table', { name: 'Montants par mois' })
const barValues = () => within(barsTable()).getAllByRole('row').slice(1).map((r) => norm(r.lastElementChild!.textContent))

describe('Graphiques', () => {
  it('rien tant que les données ne sont pas prêtes', () => {
    setData([], false)
    const { container } = renderPage()
    expect(container).toBeEmptyDOMElement()
  })

  it('à l’ouverture : mois en cours, « en cours », « Mois suivant » désactivé', () => {
    setData(demo.expenses)
    renderPage()
    expect(screen.getByRole('heading', { name: 'Graphiques' })).toBeInTheDocument()
    expect(within(picker()).getByText(formatMonthTitle(M))).toBeInTheDocument()
    expect(screen.getAllByText('en cours').length).toBeGreaterThanOrEqual(1)
    expect(next()).toBeDisabled()
    expect(prev()).toBeEnabled()
  })

  it('« Mois précédent » jusqu’à M-4, puis désactivé ; à M-1, légende du jeu de démo', () => {
    setData(demo.expenses)
    renderPage()
    fireEvent.click(prev())
    expect(within(picker()).getByText(formatMonthTitle(addMonths(M, -1)))).toBeInTheDocument()
    expect(norm(screen.getByTestId('donut-total').textContent)).toBe('46 000 DA dépensés')
    const items = within(legend()).getAllByRole('listitem').map((li) => norm(li.textContent))
    expect(items).toEqual(['Courses 30 000 DA 65 %', 'Sorties 7 000 DA 15 %', 'Repas 6 000 DA 13 %', 'Transport 3 000 DA 7 %'])
    fireEvent.click(prev()); fireEvent.click(prev()); fireEvent.click(prev())
    expect(within(picker()).getByText(formatMonthTitle(addMonths(M, -4)))).toBeInTheDocument()
    expect(prev()).toBeDisabled()
    expect(next()).toBeEnabled()
  })

  it('menu des barres : toutes les dépenses puis Sorties ; la légende ne change pas', () => {
    setData(demo.expenses)
    renderPage()
    const select = screen.getByLabelText('Barres pour')
    expect(select).toHaveValue('all')
    expect(barValues().slice(0, 4)).toEqual(['44 000 DA', '43 800 DA', '44 200 DA', '46 000 DA'])
    const before = norm(legend().textContent)
    fireEvent.change(select, { target: { value: 'sorties' } })
    expect(barValues()).toEqual(['5 000 DA', '4 800 DA', '5 200 DA', '7 000 DA', '0 DA'])
    expect(norm(legend().textContent)).toBe(before)
    expect(screen.getByText('Montants en DA')).toBeInTheDocument()
  })

  it('nouvelle ouverture : mois en cours et « Toutes les dépenses »', () => {
    setData(demo.expenses)
    const { unmount } = renderPage()
    fireEvent.click(prev())
    fireEvent.change(screen.getByLabelText('Barres pour'), { target: { value: 'sorties' } })
    unmount()
    renderPage()
    expect(within(picker()).getByText(formatMonthTitle(M))).toBeInTheDocument()
    expect(screen.getByLabelText('Barres pour')).toHaveValue('all')
  })

  it('aucune dépense : « Aucune dépense ce mois-ci » et « Ajouter une dépense »', () => {
    setData([])
    renderPage()
    expect(screen.getByText('Aucune dépense ce mois-ci')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ajouter une dépense' })).toHaveAttribute('href', '/depense/nouvelle')
    expect(prev()).toBeDisabled()
  })

  it('mois passé sans dépense : « Aucune dépense en … » sans bouton', () => {
    setData([{ id: 'x', amount: 500, categoryId: 'repas', date: `${addMonths(M, -2)}-10`, createdAt: 1 }])
    renderPage()
    fireEvent.click(prev())
    const label = addMonths(M, -1)
    const monthText = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date(Number(label.slice(0, 4)), Number(label.slice(5)) - 1, 1))
    expect(screen.getByText(`Aucune dépense en ${monthText} ${label.slice(0, 4)}`)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Ajouter une dépense' })).not.toBeInTheDocument()
  })

  it('graphiques hors du parcours clavier (cachés aux lecteurs d’écran, rien à toucher)', () => {
    setData(demo.expenses)
    const { container } = renderPage()
    expect(container.querySelector('.recharts-pie')).not.toBeNull()
    expect(container.querySelector('[aria-hidden="true"] [tabindex="0"]')).toBeNull()
  })

  it('libellé du mois lisible d’un seul tenant : « Novembre 2026 en cours »', () => {
    setData(demo.expenses)
    renderPage()
    expect(norm(screen.getByRole('group', { name: 'Mois détaillé' }).querySelector('.month-picker-label')!.textContent)).toBe(`${formatMonthTitle(M)} en cours`)
  })

  it('statistiques seulement : ni couleur de budget, ni ampoule', () => {
    setData(demo.expenses)
    const { container } = renderPage()
    expect(container.querySelector('[class*="status-"]')).toBeNull()
    expect(container.querySelector('svg.lucide-lightbulb')).toBeNull()
  })

  it('mois choisi qui n’est plus couvert après un changement de données : retour au mois en cours', () => {
    setData(demo.expenses)
    const { rerender } = renderPage()
    fireEvent.click(prev()); fireEvent.click(prev()); fireEvent.click(prev())
    setData([{ id: 'y', amount: 100, categoryId: 'repas', date: `${M}-01`, createdAt: 1 }])
    rerender(<MemoryRouter><ChartsPage /></MemoryRouter>)
    expect(within(picker()).getByText(formatMonthTitle(M))).toBeInTheDocument()
  })
})
