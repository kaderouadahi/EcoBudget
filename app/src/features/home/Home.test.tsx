import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/defaults'
import type { Expense, UserDoc } from '../../data/model'
import { HomeView } from './Home'

const TODAY = new Date(2026, 10, 19)
const user = (p: Partial<UserDoc> = {}): UserDoc => ({ alertsEnabled: true, adviceEnabled: true, onboardingDone: true, ...p })
const exp = (id: string, p: Partial<Expense>): Expense => ({ id, amount: 100, categoryId: 'repas', date: '2026-11-19', createdAt: 0, ...p })

function renderHome(u: UserDoc, expenses: Expense[] = []) {
  return render(
    <MemoryRouter>
      <HomeView user={u} categories={DEFAULT_CATEGORIES} expenses={expenses} today={TODAY} />
    </MemoryRouter>,
  )
}

describe('Accueil', () => {
  it('première ouverture : bienvenue, action principale, catégories prêtes, budget facultatif, connexion', () => {
    renderHome(user({ onboardingDone: false }))
    expect(screen.getByRole('heading', { name: 'Bienvenue sur EcoBudget' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Noter ma première dépense' })).toHaveAttribute('href', '/depense/nouvelle')
    expect(screen.getByText('Vos catégories sont prêtes')).toBeInTheDocument()
    expect(screen.getByText('Courses')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Fixer un budget/ })).toHaveAttribute('href', '/budgets')
    expect(screen.getByRole('link', { name: 'Se connecter' })).toHaveAttribute('href', '/compte/connexion')
  })

  it('ensuite : plus de bienvenue', () => {
    renderHome(user())
    expect(screen.queryByText('Bienvenue sur EcoBudget')).not.toBeInTheDocument()
  })

  it('« Bonjour [prénom] » ou « Bonjour », et le mois', () => {
    renderHome(user({ firstName: 'Nadia' }))
    expect(screen.getByRole('heading', { name: 'Bonjour Nadia' })).toBeInTheDocument()
    expect(screen.getByText('Novembre 2026')).toBeInTheDocument()
  })

  it('dernières dépenses : 4 au plus, titre = note sinon catégorie, montant négatif', () => {
    renderHome(user(), [
      exp('a', { note: 'Cafétéria', amount: 250, createdAt: 5 }),
      exp('b', { categoryId: 'courses', amount: 6500, createdAt: 4 }),
      exp('c', { categoryId: 'sorties', date: '2026-11-14', amount: 4500 }),
      exp('d', { categoryId: 'transport', date: '2026-11-13', amount: 50 }),
      exp('e', { date: '2026-11-01' }),
    ])
    const list = screen.getByRole('list', { name: 'Dernières dépenses' })
    const items = within(list).getAllByRole('link')
    expect(items).toHaveLength(4)
    expect(items[0]).toHaveTextContent('Cafétéria')
    expect(items[0]).toHaveTextContent("Repas · Aujourd'hui")
    expect(items[0].textContent).toContain(String.fromCharCode(0x2212) + '250' + String.fromCharCode(0xa0) + 'DA')
    expect(items[0]).toHaveAttribute('href', '/depense/a')
    expect(items[1]).toHaveTextContent('Courses')
    expect(items[2]).toHaveTextContent('Sorties · Samedi')
  })

  it('aucune dépense : invitation à noter la première', () => {
    renderHome(user())
    expect(screen.getByText(/Aucune dépense pour l'instant/)).toBeInTheDocument()
  })
})
