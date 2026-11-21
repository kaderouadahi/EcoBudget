import { fireEvent, render, screen, within } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/defaults'
import type { Budget, Expense, UnusualAlert, UserDoc } from '../../data/model'
import { HomeView } from './Home'

const TODAY = new Date(2026, 10, 19)
const user = (p: Partial<UserDoc> = {}): UserDoc => ({ alertsEnabled: true, adviceEnabled: true, onboardingDone: true, ...p })
const exp = (id: string, p: Partial<Expense>): Expense => ({ id, amount: 100, categoryId: 'repas', date: '2026-11-19', createdAt: 0, ...p })

function renderHome(u: UserDoc, expenses: Expense[] = [], budgets: Budget[] = [], alert: UnusualAlert | null = null, onDismissAlert = () => {}, anonymous = false) {
  return render(
    <MemoryRouter>
      <HomeView user={u} categories={DEFAULT_CATEGORIES} expenses={expenses} budgets={budgets} today={TODAY} alert={alert} onDismissAlert={onDismissAlert} anonymous={anonymous} />
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

  it('H14 : carte « Compte » avec un compte anonyme (avec et sans dépenses), absente avec un compte e-mail', () => {
    const card = () => screen.queryByRole('region', { name: 'Compte' })
    const check = () => {
      expect(card()).toHaveTextContent('Retrouvez vos dépenses sur tous vos appareils.')
      expect(within(card()!).getByRole('link', { name: 'Créer un compte' })).toHaveAttribute('href', '/compte/creer')
      expect(within(card()!).getByRole('link', { name: 'Se connecter' })).toHaveAttribute('href', '/compte/connexion')
    }
    let r = renderHome(user({ onboardingDone: false }), [], [], null, () => {}, true)
    check()
    // Première ouverture : juste sous « Bienvenue », avant « Vos catégories sont prêtes ».
    expect(screen.getByRole('heading', { name: /Bienvenue sur EcoBudget/ }).closest('section')!.nextElementSibling).toBe(card())
    r.unmount()
    r = renderHome(user(), [exp('a', {})], [{ id: 'repas', amount: 8000 }], null, () => {}, true)
    check()
    // Ensuite : juste sous « Reste à dépenser ».
    expect(screen.getByRole('region', { name: 'Reste à dépenser' }).nextElementSibling).toBe(card())
    r.unmount()
    renderHome(user(), [exp('a', {})], [], null, () => {}, false)
    expect(card()).not.toBeInTheDocument()
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

  it('« Tout voir » des dernières dépenses mène à la liste du mois, dès une dépense (H10)', () => {
    const { unmount } = renderHome(user(), [exp('a', {})])
    expect(screen.getByRole('link', { name: 'Tout voir les dépenses' })).toHaveAttribute('href', '/depenses')
    unmount()
    renderHome(user(), [])
    expect(screen.queryByRole('link', { name: 'Tout voir les dépenses' })).not.toBeInTheDocument()
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

  const norm = (s: string | null) => (s ?? '').replace(/\s/g, ' ')

  it('reste à dépenser en tête, avec budgets, jours restants et hors budget', () => {
    const { container } = renderHome(user(), [
      exp('c', { categoryId: 'courses', amount: 34000 }),
      exp('s', { categoryId: 'sante', amount: 1800 }),
    ], [{ id: 'courses', amount: 40000 }, { id: 'repas', amount: 8000 }])
    const text = norm(container.textContent)
    expect(text).toContain('Reste à dépenser en novembre')
    expect(text).toContain('14 000 DA')
    expect(text).toContain('sur 48 000 DA de budgets · 12 jours restants')
    expect(screen.getByRole('heading', { name: 'Vos budgets' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tout voir' })).toHaveAttribute('href', '/budgets')
    expect(text).toContain('Il reste 6 000 DA')
    expect(text).toContain('Hors budget : Santé')
  })

  it('budgets dépassés : en rouge avec icône et texte', () => {
    const { container } = renderHome(user(), [exp('c', { categoryId: 'courses', amount: 41000 })], [{ id: 'courses', amount: 40000 }])
    expect(norm(container.textContent)).toContain('Budgets dépassés de1 000 DA')
    expect(screen.getByTestId('headline-alert')).toBeInTheDocument()
  })

  it('aucun budget : dépensé ce mois et invitation à fixer un budget', () => {
    const { container } = renderHome(user(), [exp('c', { categoryId: 'courses', amount: 2500 })])
    expect(norm(container.textContent)).toContain('Dépensé ce mois')
    expect(norm(container.textContent)).toContain('2 500 DA')
    expect(screen.getByRole('link', { name: /Fixer un budget/ })).toHaveAttribute('href', '/budgets/fixer')
  })

  describe('alerte de dépense inhabituelle', () => {
    const WHY = "D'habitude, une dépense en Sorties est d'environ 1 000 DA. Celle-ci est 4,5 fois plus élevée. Calcul fait sur vos 16 dépenses en Sorties depuis le 21 septembre."
    const alert: UnusualAlert = { expenseId: 'x', amount: 4500, categoryId: 'sorties', date: '2026-11-14', why: WHY }
    const withAlert = (onDismiss = vi.fn()) => {
      const r = renderHome(user(), [exp('x', { amount: 4500, categoryId: 'sorties', date: '2026-11-14' })], [], alert, onDismiss)
      return { ...r, onDismiss }
    }

    it('carte : cloche, titre, montant · jour, sans couleur de budget', () => {
      const { container } = withAlert()
      const card = screen.getByRole('region', { name: 'Dépense inhabituelle en Sorties' })
      expect(norm(card.textContent)).toContain('4 500 DA · Samedi, nettement plus que d\'habitude')
      expect(within(card).getByRole('button', { name: 'Pourquoi ?' })).toBeInTheDocument()
      expect(within(card).getByRole('button', { name: 'Compris' })).toBeInTheDocument()
      expect(card.querySelector('svg.lucide-bell')).not.toBeNull()
      expect(container.querySelector('.alert-card .status-warn, .alert-card .status-over, .alert-card .status-ok')).toBeNull()
    })

    it('« Pourquoi ? » ouvre le panneau avec la phrase et « Gérer les alertes » ; la croix le ferme, la carte reste', () => {
      withAlert()
      fireEvent.click(screen.getByRole('button', { name: 'Pourquoi ?' }))
      const panel = screen.getByRole('dialog', { name: 'Dépense inhabituelle en Sorties' })
      expect(norm(panel.textContent)).toContain(WHY.replace(/\s/g, ' '))
      expect(norm(panel.textContent)).toContain('4 500 DA · Samedi')
      expect(within(panel).getByRole('link', { name: 'Gérer les alertes' })).toHaveAttribute('href', '/reglages#alertes')
      fireEvent.click(within(panel).getByRole('button', { name: 'Fermer' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByRole('region', { name: 'Dépense inhabituelle en Sorties' })).toBeInTheDocument()
    })

    it('« Compris » sur la carte ferme l’alerte', () => {
      const { onDismiss } = withAlert()
      fireEvent.click(screen.getByRole('button', { name: 'Compris' }))
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('« Compris » dans le panneau ferme l’alerte', () => {
      const { onDismiss } = withAlert()
      fireEvent.click(screen.getByRole('button', { name: 'Pourquoi ?' }))
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Compris' }))
      expect(onDismiss).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('« Pourquoi ? » après un renommage : nom actuel de la catégorie, chiffres de l’ajout', () => {
      const cats = DEFAULT_CATEGORIES.map((c) => (c.id === 'sorties' ? { ...c, name: 'Loisirs' } : c))
      const stored: UnusualAlert = { ...alert, median: 1000, ratio: 4.5, count: 16, oldest: '2026-09-21' }
      render(
        <MemoryRouter>
          <HomeView user={user()} categories={cats} expenses={[exp('x', { amount: 4500, categoryId: 'sorties', date: '2026-11-14' })]} budgets={[]} today={TODAY} alert={stored} />
        </MemoryRouter>,
      )
      fireEvent.click(screen.getByRole('button', { name: 'Pourquoi ?' }))
      const panel = screen.getByRole('dialog', { name: 'Dépense inhabituelle en Loisirs' })
      expect(norm(panel.textContent)).toContain("D'habitude, une dépense en Loisirs est d'environ 1 000 DA. Celle-ci est 4,5 fois plus élevée. Calcul fait sur vos 16 dépenses en Loisirs depuis le 21 septembre.")
    })

    it('pas d’alerte : pas de carte', () => {
      renderHome(user())
      expect(screen.queryByRole('region', { name: /Dépense inhabituelle/ })).not.toBeInTheDocument()
    })
  })
})
