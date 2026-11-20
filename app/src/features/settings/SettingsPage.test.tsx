import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/defaults'
import type { UserDoc } from '../../data/model'

const setUserFields = vi.fn()
const applyBatch = vi.fn()
let data: Record<string, unknown> = {}
vi.mock('../../auth/AuthGate', () => ({ useUid: () => 'u1' }))
vi.mock('../../data/repo', () => ({
  setUserFields: (...a: unknown[]) => setUserFields(...a),
  createDoc: vi.fn(), updateDocFields: vi.fn(), removeDoc: vi.fn(), applyBatch: (...a: unknown[]) => applyBatch(...a),
}))
vi.mock('../../data/DataProvider', () => ({ useData: () => data }))

import { ToastProvider } from '../../ui/Toast'
import { SettingsPage } from './SettingsPage'

const user = (p: Partial<UserDoc> = {}): UserDoc => ({ alertsEnabled: true, adviceEnabled: true, onboardingDone: true, ...p })
function setup(u: UserDoc = user(), expenses: unknown[] = [], budgets: unknown[] = []) {
  data = { user: u, categories: DEFAULT_CATEGORIES, expenses, budgets, ready: true }
  return render(<MemoryRouter><ToastProvider><SettingsPage /></ToastProvider></MemoryRouter>)
}
const status = () => screen.getByRole('status')

describe('Réglages', () => {
  beforeEach(() => setUserFields.mockClear())

  it('trois sections dans l’ordre, compte anonyme sans boutons de compte', () => {
    setup()
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Compte', 'Catégories', 'Alertes et conseils'])
    expect(screen.getByText('Sans compte')).toBeInTheDocument()
    expect(screen.getByText('Vos données sont enregistrées de façon anonyme sur cet appareil.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Créer un compte|Se connecter/ })).not.toBeInTheDocument()
  })

  it('« Autres » en dernier, verrouillée, sans crayon ni corbeille', () => {
    setup()
    const list = screen.getByRole('list', { name: 'Catégories' })
    const items = within(list).getAllByRole('listitem')
    const last = items[items.length - 1]
    expect(last).toHaveTextContent('Autres')
    expect(last).toHaveTextContent('Toujours présente')
    expect(within(last).queryByRole('link')).not.toBeInTheDocument()
    expect(within(last).queryByRole('button')).not.toBeInTheDocument()
  })

  it('crayon « Modifier [nom] » sur chaque catégorie sauf Autres, bouton « Ajouter une catégorie »', () => {
    setup()
    expect(screen.getByRole('link', { name: 'Modifier Courses' })).toHaveAttribute('href', '/reglages/categories/courses')
    expect(screen.queryByRole('link', { name: 'Modifier Autres' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ajouter une catégorie' })).toHaveAttribute('href', '/reglages/categories/nouvelle')
  })

  it('prénom : enregistré en quittant le champ, espaces retirés, message', () => {
    setup()
    const input = screen.getByLabelText('Votre prénom (facultatif)')
    fireEvent.change(input, { target: { value: '  Yasmine ' } })
    fireEvent.blur(input)
    expect(setUserFields).toHaveBeenCalledWith('u1', { firstName: 'Yasmine' })
    expect(status()).toHaveTextContent('Prénom enregistré')
  })

  it('prénom gardé si l’écran se ferme sans quitter le champ (geste retour Android)', () => {
    const { unmount } = setup()
    fireEvent.change(screen.getByLabelText('Votre prénom (facultatif)'), { target: { value: 'Amine' } })
    unmount()
    expect(setUserFields).toHaveBeenCalledWith('u1', { firstName: 'Amine' })
  })

  it('prénom inchangé : rien n’est écrit ; vidé : prénom effacé', () => {
    setup(user({ firstName: 'Nadia' }))
    const input = screen.getByLabelText('Votre prénom (facultatif)')
    expect(input).toHaveValue('Nadia')
    expect(screen.getByText('Affiché sur l’accueil : « Bonjour Nadia »'.replace('’', "'"))).toBeInTheDocument()
    fireEvent.blur(input)
    expect(setUserFields).not.toHaveBeenCalled()
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(setUserFields).toHaveBeenCalledWith('u1', { firstName: undefined })
  })

  it('interrupteurs : état écrit en texte, effet immédiat, message sans « Annuler »', () => {
    setup()
    const alerts = screen.getByRole('switch', { name: 'Dépenses inhabituelles' })
    expect(alerts).toHaveAttribute('aria-checked', 'true')
    expect(alerts).toHaveTextContent('Activé')
    fireEvent.click(alerts)
    expect(setUserFields).toHaveBeenCalledWith('u1', { alertsEnabled: false })
    expect(status()).toHaveTextContent('Alertes désactivées')
    expect(within(status()).queryByRole('button', { name: 'Annuler' })).not.toBeInTheDocument()
    const advice = screen.getByRole('switch', { name: 'Conseils d’épargne'.replace('’', "'") })
    fireEvent.click(advice)
    expect(setUserFields).toHaveBeenCalledWith('u1', { adviceEnabled: false })
    expect(status()).toHaveTextContent('Conseils désactivés')
  })

  it('interrupteur désactivé : « Désactivé », réactivation', () => {
    setup(user({ alertsEnabled: false, adviceEnabled: false }))
    const alerts = screen.getByRole('switch', { name: 'Dépenses inhabituelles' })
    expect(alerts).toHaveAttribute('aria-checked', 'false')
    expect(alerts).toHaveTextContent('Désactivé')
    act(() => fireEvent.click(alerts))
    expect(setUserFields).toHaveBeenCalledWith('u1', { alertsEnabled: true })
    expect(status()).toHaveTextContent('Alertes activées')
  })

  it('section « Alertes et conseils » adressable (#alertes)', () => {
    const { container } = setup()
    expect(container.querySelector('#alertes')).toHaveTextContent('Alertes et conseils')
  })

  describe('supprimer une catégorie', () => {
    const exps = [1, 2, 3].map((i) => ({ id: `s${i}`, amount: 1000, categoryId: 'sorties', date: `2026-1${i % 2}-0${i}`, createdAt: i }))
    const open = () => fireEvent.click(screen.getByRole('button', { name: 'Supprimer Sorties' }))

    it('corbeille sur chaque catégorie sauf Autres ; confirmation avec menu, Autres par défaut', () => {
      setup(user(), exps, [{ id: 'sorties', amount: 5000 }])
      expect(screen.queryByRole('button', { name: 'Supprimer Autres' })).not.toBeInTheDocument()
      open()
      const dialog = screen.getByRole('alertdialog', { name: 'Supprimer la catégorie Sorties ?' })
      expect(dialog).toHaveTextContent('Les 3 dépenses de Sorties ne seront pas perdues')
      expect(dialog).toHaveTextContent('Le budget de Sorties sera supprimé.')
      expect(dialog).toHaveTextContent("Vous pourrez l'annuler juste après.")
      expect(dialog).toHaveAccessibleDescription(/Le budget de Sorties sera supprimé\./)
      const select = within(dialog).getByLabelText('Déplacer les dépenses vers')
      expect(select).toHaveValue('autres')
      expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual(['Autres', 'Repas', 'Courses', 'Transport', 'Santé', 'Logement', 'Études'])
    })

    it('choisir la catégorie cible garde le focus dans le menu', () => {
      setup(user(), exps)
      open()
      const select = screen.getByLabelText('Déplacer les dépenses vers')
      select.focus()
      fireEvent.change(select, { target: { value: 'repas' } })
      expect(document.activeElement).toBe(select)
    })

    it('sans dépense : pas de menu', () => {
      setup()
      open()
      expect(screen.getByRole('alertdialog')).toHaveTextContent('Aucune dépense dans Sorties.')
      expect(screen.queryByLabelText('Déplacer les dépenses vers')).not.toBeInTheDocument()
    })

    it('« Supprimer » : un seul envoi groupé, message ; « Annuler » : envoi groupé inverse', () => {
      applyBatch.mockClear()
      setup(user(), exps, [{ id: 'sorties', amount: 5000 }])
      open()
      fireEvent.change(screen.getByLabelText('Déplacer les dépenses vers'), { target: { value: 'repas' } })
      fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
      expect(applyBatch).toHaveBeenCalledTimes(1)
      const ops = applyBatch.mock.calls[0][1] as { sets: { data: { categoryId?: string } }[] }
      expect(ops.sets.every((w) => w.data.categoryId === 'repas')).toBe(true)
      expect(status()).toHaveTextContent('Catégorie supprimée : Sorties · 3 dépenses déplacées vers Repas')
      fireEvent.click(within(status()).getByRole('button', { name: 'Annuler' }))
      expect(applyBatch).toHaveBeenCalledTimes(2)
      const undo = applyBatch.mock.calls[1][1] as { sets: { name: string }[] }
      expect(undo.sets.map((w) => w.name).sort()).toEqual(['budgets', 'categories', 'expenses', 'expenses', 'expenses'])
    })
  })
})
