import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/defaults'
import type { UserDoc } from '../../data/model'

const setUserFields = vi.fn()
let data: Record<string, unknown> = {}
vi.mock('../../auth/AuthGate', () => ({ useUid: () => 'u1' }))
vi.mock('../../data/repo', () => ({
  setUserFields: (...a: unknown[]) => setUserFields(...a),
  createDoc: vi.fn(), updateDocFields: vi.fn(), removeDoc: vi.fn(), applyBatch: vi.fn(),
}))
vi.mock('../../data/DataProvider', () => ({ useData: () => data }))

import { ToastProvider } from '../../ui/Toast'
import { SettingsPage } from './SettingsPage'

const user = (p: Partial<UserDoc> = {}): UserDoc => ({ alertsEnabled: true, adviceEnabled: true, onboardingDone: true, ...p })
function setup(u: UserDoc = user()) {
  data = { user: u, categories: DEFAULT_CATEGORIES, expenses: [], budgets: [], ready: true }
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
})
