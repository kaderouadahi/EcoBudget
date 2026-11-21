import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/defaults'
import type { Expense } from '../../data/model'
import { buildDemoData } from '../../lib/demo'
import { formatMonthTitle } from '../../lib/format'
import { monthLabel } from '../../lib/goals'
import { addMonths, currentMonth, monthOf, toISODate } from '../../lib/month'

let data: Record<string, unknown> = {}
vi.mock('../../data/DataProvider', () => ({ useData: () => data }))

import { ExpensesPage } from './ExpensesPage'

// Liste des dépenses du mois (HANDOFF H10).
const today = new Date()
const M = currentMonth(today)
const norm = (s: string | null) => (s ?? '').replace(/\s/g, ' ')
const demo = buildDemoData(today)
let n = 0
const E = (amount: number, date: string, categoryId = 'repas', note?: string): Expense => ({ id: `e${++n}`, amount, categoryId, date, createdAt: n, note })
const setData = (expenses: Expense[], ready = true) => { data = { expenses, categories: DEFAULT_CATEGORIES, ready } }

function Probe() {
  const { state } = useLocation()
  return <p>formulaire, retour : {(state as { back?: string } | null)?.back ?? 'aucun'}</p>
}
const page = (path = '/depenses') => (
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/depenses" element={<ExpensesPage />} />
      <Route path="/depense/:id" element={<Probe />} />
    </Routes>
  </MemoryRouter>
)
const renderPage = (path?: string) => render(page(path))
const prev = () => screen.getByRole('button', { name: 'Mois précédent' })
const next = () => screen.getByRole('button', { name: 'Mois suivant' })
const picker = () => screen.getByRole('group', { name: 'Mois affiché' })
const shown = (month: string) => expect(within(picker()).getByText(formatMonthTitle(month))).toBeInTheDocument()
const dayHeadings = () => screen.queryAllByRole('heading', { level: 2 }).map((h) => norm(h.textContent))

describe('Dépenses du mois', () => {
  it('rien tant que les données ne sont pas prêtes', () => {
    setData([], false)
    const { container } = renderPage()
    expect(container).toBeEmptyDOMElement()
  })

  it('ouverture : titre, retour vers l’Accueil, mois en cours « en cours », « Mois suivant » désactivé', () => {
    setData(demo.expenses)
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Dépenses' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: "Retour à l'Accueil" })).toHaveAttribute('href', '/')
    expect(norm(picker().querySelector('.month-picker-label')!.textContent)).toBe(`${formatMonthTitle(M)} en cours`)
    expect(next()).toBeDisabled()
    expect(prev()).toBeEnabled()
  })

  it('sans limite de 6 mois : jusqu’à la plus ancienne dépense, puis « Mois précédent » désactivé', () => {
    setData([E(500, `${addMonths(M, -8)}-10`), E(100, `${M}-01`)])
    renderPage()
    for (let k = 0; k < 8; k++) fireEvent.click(prev())
    shown(addMonths(M, -8))
    expect(prev()).toBeDisabled()
    expect(next()).toBeEnabled()
  })

  it('jeu de démo : jusqu’à M-4, puis désactivé', () => {
    setData(demo.expenses)
    renderPage()
    for (let k = 0; k < 4; k++) fireEvent.click(prev())
    shown(addMonths(M, -4))
    expect(prev()).toBeDisabled()
  })

  it('total et nombre de dépenses, singulier pour une', () => {
    const P = addMonths(M, -1)
    setData([E(1000, `${P}-01`), E(2500, `${P}-28`), E(250, `${P}-12`), E(9999, `${M}-01`)])
    const { unmount } = renderPage(`/depenses?mois=${P}`)
    expect(screen.getByText(/^Total/).textContent!.replace(/\s/g, ' ')).toBe('Total : 3 750 DA · 3 dépenses')
    unmount()
    setData([E(250, `${P}-12`)])
    renderPage(`/depenses?mois=${P}`)
    expect(norm(screen.getByText(/^Total/).textContent)).toBe('Total : 250 DA · 1 dépense')
  })

  // Le 27 du mois précédent n'est jamais « Hier » (le 28 l'est le 1er mars d'une année non bissextile).
  it('groupées par jour, du plus récent au plus ancien ; lignes sans le jour', () => {
    const P = addMonths(M, -1)
    setData([E(1000, `${P}-01`), E(2500, `${P}-27`, 'courses'), E(250, `${P}-12`, 'repas', 'Cafétéria'), E(300, `${P}-12`)])
    renderPage(`/depenses?mois=${P}`)
    const heads = dayHeadings()
    expect(heads).toHaveLength(3)
    expect(heads[0]).toMatch(/ 27 /)
    expect(heads[1]).toMatch(/ 12 /)
    expect(heads[2]).toMatch(/ 1er /)
    const day12 = screen.getByRole('list', { name: heads[1] })
    const rows = within(day12).getAllByRole('link').map((a) => ['.expense-title', '.expense-sub', '.expense-amount'].map((c) => norm(a.querySelector(c)!.textContent)))
    expect(rows).toEqual([['Repas', 'Repas', '−300 DA'], ['Cafétéria', 'Repas', '−250 DA']])
  })

  it('intertitre au format long même dans la semaine en cours (pas « Jeudi » seul)', () => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2)
    const iso = toISODate(d)
    setData([E(700, iso)])
    renderPage(`/depenses?mois=${monthOf(iso)}`)
    const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(d)
    const day = d.getDate() === 1 ? '1er' : String(d.getDate())
    expect(dayHeadings()[0].startsWith(`${weekday} ${day} `)).toBe(true)
  })

  it('les flèches changent le mois ; toucher une dépense ouvre le formulaire avec le retour sur ce mois', () => {
    setData(demo.expenses)
    renderPage()
    fireEvent.click(prev()); fireEvent.click(prev())
    shown(addMonths(M, -2))
    fireEvent.click(within(screen.getAllByRole('list')[0]).getAllByRole('link')[0])
    expect(screen.getByText(`formulaire, retour : /depenses?mois=${addMonths(M, -2)}`)).toBeInTheDocument()
  })

  it('mois de l’URL affiché (retour du formulaire)', () => {
    setData(demo.expenses)
    renderPage(`/depenses?mois=${addMonths(M, -2)}`)
    shown(addMonths(M, -2))
  })

  it('mois de l’URL faux ou futur : mois en cours', () => {
    setData(demo.expenses)
    const { unmount } = renderPage('/depenses?mois=abc')
    shown(M)
    unmount()
    renderPage(`/depenses?mois=${addMonths(M, 1)}`)
    shown(M)
  })

  it('seule dépense d’un ancien mois supprimée : on reste sur ce mois, « Aucune dépense en … » sans bouton', () => {
    setData([E(100, `${M}-01`)])
    renderPage(`/depenses?mois=${addMonths(M, -2)}`)
    shown(addMonths(M, -2))
    expect(screen.getByText(`Aucune dépense en ${monthLabel(addMonths(M, -2))}`)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Ajouter une dépense' })).not.toBeInTheDocument()
    expect(prev()).toBeDisabled()
    expect(next()).toBeEnabled()
  })

  it('données changées pendant que l’écran est ouvert : on reste sur le mois affiché', () => {
    setData(demo.expenses)
    const { rerender } = renderPage(`/depenses?mois=${addMonths(M, -4)}`)
    setData([E(100, `${M}-01`)])
    rerender(page(`/depenses?mois=${addMonths(M, -4)}`))
    shown(addMonths(M, -4))
    expect(screen.getByText(`Aucune dépense en ${monthLabel(addMonths(M, -4))}`)).toBeInTheDocument()
  })

  it('mois en cours sans dépense : message, « Ajouter une dépense », pas de total', () => {
    setData([E(100, `${addMonths(M, -1)}-05`)])
    renderPage()
    expect(screen.getByText('Aucune dépense ce mois-ci')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ajouter une dépense' })).toHaveAttribute('href', '/depense/nouvelle')
    expect(screen.queryByText(/^Total/)).not.toBeInTheDocument()
  })
})
