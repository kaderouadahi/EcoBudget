import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CREATED_MESSAGE, EMAIL_EXISTS, EMAIL_INCOMPLETE, PASSWORD_RULE } from '../../lib/account'

const refresh = vi.fn()
let account = { uid: 'u1', email: null as string | null, isAnonymous: true, refresh }
vi.mock('../../auth/AuthGate', () => ({ useUid: () => 'u1', useAccount: () => account }))
const createAccount = vi.fn()
vi.mock('../../auth/actions', () => ({ createAccount: (...a: unknown[]) => createAccount(...a) }))
const setUserFields = vi.fn()
vi.mock('../../data/repo', () => ({ setUserFields: (...a: unknown[]) => setUserFields(...a) }))
const loaded = { user: { firstName: 'Nadia', alertsEnabled: true, adviceEnabled: true, onboardingDone: true }, expenses: [], ready: true }
let data: Record<string, unknown> = loaded
vi.mock('../../data/DataProvider', () => ({ useData: () => data }))

import { ToastProvider } from '../../ui/Toast'
import { CreateAccountPage } from './CreateAccountPage'

function Probe({ name }: { name: string }) {
  const { state } = useLocation()
  return <p>{`écran ${name} ${(state as { email?: string } | null)?.email ?? ''}`.trim()}</p>
}

const tree = () => (
  <MemoryRouter initialEntries={['/compte/creer']}>
    <ToastProvider>
      <Routes>
        <Route path="/compte/creer" element={<CreateAccountPage />} />
        <Route path="/compte/connexion" element={<Probe name="connexion" />} />
        <Route path="/reglages" element={<Probe name="réglages" />} />
      </Routes>
    </ToastProvider>
  </MemoryRouter>
)
function setup() {
  return render(tree())
}
const email = () => screen.getByLabelText('Adresse e-mail')
const password = () => screen.getByLabelText('Mot de passe')
const submit = () => screen.getByRole('button', { name: 'Créer mon compte' })
const conditions = () => screen.getByRole('list', { name: 'Conditions du mot de passe' })
const condition = (label: string) => within(conditions()).getByText(label).closest('li')!
function fill(e: string, p: string) {
  fireEvent.change(email(), { target: { value: e } })
  fireEvent.change(password(), { target: { value: p } })
}

describe('Créer un compte', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    account = { uid: 'u1', email: null, isAnonymous: true, refresh }
    data = loaded
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
  })
  afterEach(() => vi.restoreAllMocks())

  it('écran ouvert directement (données pas encore chargées) : prénom prérempli quand elles arrivent, jamais effacé', async () => {
    data = { user: null, expenses: [], ready: false }
    createAccount.mockResolvedValue(undefined)
    const { rerender } = setup()
    data = loaded
    rerender(tree())
    expect(screen.getByLabelText('Prénom (facultatif)')).toHaveValue('Nadia')
    fill('yasmine@gmail.com', 'abcdefg1')
    await act(async () => { fireEvent.click(submit()) })
    expect(setUserFields).not.toHaveBeenCalled()
  })

  it('titre, bandeau, prénom prérempli avec son aide', () => {
    setup()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Créer un compte')
    expect(screen.getByText('Facultatif')).toBeInTheDocument()
    expect(screen.getByText('Ce que vous avez déjà noté est conservé.')).toBeInTheDocument()
    expect(screen.getByLabelText('Prénom (facultatif)')).toHaveValue('Nadia')
    expect(screen.getByText("Affiché sur l'accueil")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Se connecter' })).toHaveAttribute('href', '/compte/connexion')
  })

  it('conditions visibles dès l’ouverture, remplies ou non pendant la saisie', () => {
    setup()
    expect(within(conditions()).getAllByText('Condition non remplie')).toHaveLength(2)
    fireEvent.change(password(), { target: { value: 'abc12345' } })
    expect(within(conditions()).getAllByText('Condition remplie')).toHaveLength(2)
    fireEvent.change(password(), { target: { value: 'abcdefgh' } })
    expect(condition('Au moins 8 caractères')).toHaveTextContent('Condition remplie')
    expect(condition('Au moins un chiffre')).toHaveTextContent('Condition non remplie')
  })

  it('« Afficher » puis « Masquer » le mot de passe', () => {
    setup()
    expect(password()).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByRole('button', { name: 'Afficher' }))
    expect(password()).toHaveAttribute('type', 'text')
    fireEvent.click(screen.getByRole('button', { name: 'Masquer' }))
    expect(password()).toHaveAttribute('type', 'password')
  })

  it('adresse incomplète : erreur au champ, rien n’est envoyé', () => {
    setup()
    fill('yasmine@', 'abcdefg1')
    fireEvent.click(submit())
    expect(email()).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(EMAIL_INCOMPLETE)).toBeInTheDocument()
    expect(createAccount).not.toHaveBeenCalled()
  })

  it('condition non remplie : ligne en erreur et règle sous le champ, rien n’est envoyé', () => {
    setup()
    fill('yasmine@gmail.com', 'abcdef1')
    fireEvent.click(submit())
    expect(condition('Au moins 8 caractères')).toHaveClass('is-error')
    expect(condition('Au moins un chiffre')).not.toHaveClass('is-error')
    expect(screen.getByText(PASSWORD_RULE)).toBeInTheDocument()
    expect(password()).toHaveAttribute('aria-invalid', 'true')
    expect(createAccount).not.toHaveBeenCalled()
  })

  it('adresse déjà utilisée : message et lien « Se connecter » avec l’adresse', async () => {
    createAccount.mockRejectedValue({ code: 'auth/email-already-in-use' })
    setup()
    fill('yasmine@gmail.com', 'abcdefg1')
    await act(async () => { fireEvent.click(submit()) })
    const error = screen.getByText(EMAIL_EXISTS).closest('.field-error') as HTMLElement
    fireEvent.click(within(error).getByRole('link', { name: 'Se connecter' }))
    expect(screen.getByText('écran connexion yasmine@gmail.com')).toBeInTheDocument()
  })

  it('hors connexion : message, rien n’est envoyé', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    setup()
    fill('yasmine@gmail.com', 'abcdefg1')
    fireEvent.click(submit())
    expect(screen.getByRole('alert')).toHaveTextContent('Connectez-vous à internet pour créer votre compte.')
    expect(createAccount).not.toHaveBeenCalled()
  })

  it('autre échec : message général et « Réessayer »', async () => {
    createAccount.mockRejectedValueOnce({ code: 'auth/internal-error' }).mockResolvedValueOnce(undefined)
    setup()
    fill('yasmine@gmail.com', 'abcdefg1')
    await act(async () => { fireEvent.click(submit()) })
    expect(screen.getByRole('alert')).toHaveTextContent("Le compte n'a pas pu être créé.")
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Réessayer' })) })
    expect(createAccount).toHaveBeenCalledTimes(2)
    expect(screen.getByText('écran réglages')).toBeInTheDocument()
  })

  it('succès : compte relu, prénom changé enregistré, retour à Réglages avec le message', async () => {
    createAccount.mockResolvedValue(undefined)
    setup()
    fireEvent.change(screen.getByLabelText('Prénom (facultatif)'), { target: { value: ' Yasmine ' } })
    fill('yasmine@gmail.com', 'abcdefg1')
    await act(async () => { fireEvent.click(submit()) })
    expect(createAccount).toHaveBeenCalledWith('yasmine@gmail.com', 'abcdefg1')
    expect(refresh).toHaveBeenCalled()
    expect(setUserFields).toHaveBeenCalledWith('u1', { firstName: 'Yasmine' })
    expect(screen.getByText('écran réglages')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(CREATED_MESSAGE)
  })

  it('succès, prénom inchangé : rien n’est écrit', async () => {
    createAccount.mockResolvedValue(undefined)
    setup()
    fill('yasmine@gmail.com', 'abcdefg1')
    await act(async () => { fireEvent.click(submit()) })
    expect(setUserFields).not.toHaveBeenCalled()
  })

  it('double appui : un seul envoi', async () => {
    createAccount.mockReturnValue(new Promise(() => {}))
    setup()
    fill('yasmine@gmail.com', 'abcdefg1')
    await act(async () => {
      fireEvent.click(submit())
      fireEvent.click(submit())
    })
    expect(createAccount).toHaveBeenCalledTimes(1)
  })

  describe('focus sur la première erreur (comme le formulaire Dépense)', () => {
    it('adresse incomplète : focus sur l’adresse', () => {
      setup()
      fill('yasmine@', 'abcdef1')
      fireEvent.click(submit())
      expect(email()).toHaveFocus()
    })
    it('adresse correcte, condition non remplie : focus sur le mot de passe', () => {
      setup()
      fill('yasmine@gmail.com', 'abcdef1')
      fireEvent.click(submit())
      expect(password()).toHaveFocus()
    })
    it('adresse déjà utilisée (Firebase) : focus sur l’adresse', async () => {
      createAccount.mockRejectedValue({ code: 'auth/email-already-in-use' })
      setup()
      fill('yasmine@gmail.com', 'abcdefg1')
      await act(async () => { fireEvent.click(submit()) })
      expect(email()).toHaveFocus()
    })
  })

  it('déjà connecté avec un compte e-mail : retour à Réglages', () => {
    account = { uid: 'u1', email: 'y@g.co', isAnonymous: false, refresh }
    setup()
    expect(screen.getByText('écran réglages')).toBeInTheDocument()
  })
})
