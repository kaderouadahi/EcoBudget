import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  EMAIL_INCOMPLETE, PASSWORD_MISSING, RESET_EMAIL_MISSING, RESET_SENT, SIGNED_IN_MESSAGE, SIGNIN_WRONG, TOO_MANY_SIGNIN,
} from '../../lib/account'

let account = { uid: 'anon-1', email: null as string | null, isAnonymous: true, refresh: () => {} }
vi.mock('../../auth/AuthGate', () => ({ useUid: () => account.uid, useAccount: () => account }))
const signIn = vi.fn()
const sendReset = vi.fn()
vi.mock('../../auth/actions', () => ({
  signIn: (...a: unknown[]) => signIn(...a),
  sendReset: (...a: unknown[]) => sendReset(...a),
}))
let expenses: unknown[] = []
vi.mock('../../data/DataProvider', () => ({ useData: () => ({ user: null, expenses, ready: true }) }))

import { ToastProvider } from '../../ui/Toast'
import { SignInPage } from './SignInPage'

const tree = (state?: { email: string }) => (
  <MemoryRouter initialEntries={[{ pathname: '/compte/connexion', state }]}>
    <ToastProvider>
      <Routes>
        <Route path="/compte/connexion" element={<SignInPage />} />
        <Route path="/" element={<p>écran accueil</p>} />
        <Route path="/reglages" element={<p>écran réglages</p>} />
      </Routes>
    </ToastProvider>
  </MemoryRouter>
)
function setup(state?: { email: string }) {
  return render(tree(state))
}
const email = () => screen.getByLabelText('Adresse e-mail')
const password = () => screen.getByLabelText('Mot de passe')
const submit = () => screen.getByRole('button', { name: 'Se connecter' })
const forgot = () => screen.getByRole('button', { name: 'Mot de passe oublié ?' })
const warning = () => document.querySelector('.device-warning')
function fill(e: string, p: string) {
  fireEvent.change(email(), { target: { value: e } })
  fireEvent.change(password(), { target: { value: p } })
}

describe('Se connecter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    expenses = []
    account = { uid: 'anon-1', email: null, isAnonymous: true, refresh: () => {} }
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
  })
  afterEach(() => vi.restoreAllMocks())

  it('titre, sous-titre, champs sans conditions, liens', () => {
    setup()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Se connecter')
    expect(screen.getByText('Retrouvez vos données')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Conditions du mot de passe' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Créer un compte' })).toHaveAttribute('href', '/compte/creer')
    expect(forgot()).toBeInTheDocument()
  })

  it('appareil sans dépense : pas d’avertissement', () => {
    setup()
    expect(warning()).toBeNull()
  })

  it('2 dépenses : avertissement au pluriel, juste au-dessus du bouton', () => {
    expenses = [{ id: 'a' }, { id: 'b' }]
    setup()
    expect(warning()).toHaveTextContent('Cet appareil contient 2 dépenses notées sans compte. Elles ne seront pas ajoutées à votre compte et ne seront plus visibles ici.')
    expect([...warning()!.querySelectorAll('strong')].map((s) => s.textContent)).toEqual(['2 dépenses', 'ne seront pas ajoutées'])
    expect(warning()!.nextElementSibling).toBe(submit())
  })

  it('1 dépense : avertissement au singulier', () => {
    expenses = [{ id: 'a' }]
    setup()
    expect(warning()).toHaveTextContent('Cet appareil contient 1 dépense notée sans compte. Elle ne sera pas ajoutée à votre compte et ne sera plus visible ici.')
  })

  it('adresse préremplie depuis « Un compte existe déjà »', () => {
    setup({ email: 'yasmine@gmail.com' })
    expect(email()).toHaveValue('yasmine@gmail.com')
  })

  it('adresse incomplète ou mot de passe vide : erreurs aux champs, rien n’est envoyé', () => {
    setup()
    fill('yasmine@', '')
    fireEvent.click(submit())
    expect(screen.getByText(EMAIL_INCOMPLETE)).toBeInTheDocument()
    expect(email()).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(PASSWORD_MISSING)).toBeInTheDocument()
    expect(signIn).not.toHaveBeenCalled()
  })

  it('adresse ou mot de passe faux : un seul message, sous le mot de passe', async () => {
    signIn.mockRejectedValue({ code: 'auth/invalid-credential' })
    setup()
    fill('yasmine@gmail.com', 'mauvais1')
    await act(async () => { fireEvent.click(submit()) })
    expect(screen.getByText(SIGNIN_WRONG)).toBeInTheDocument()
    expect(password()).toHaveAttribute('aria-invalid', 'true')
    expect(email()).toHaveAttribute('aria-invalid', 'false')
  })

  it('trop d’essais : message', async () => {
    signIn.mockRejectedValue({ code: 'auth/too-many-requests' })
    setup()
    fill('yasmine@gmail.com', 'mauvais1')
    await act(async () => { fireEvent.click(submit()) })
    expect(screen.getByText(TOO_MANY_SIGNIN)).toBeInTheDocument()
  })

  it('hors connexion : message, rien n’est envoyé', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    setup()
    fill('yasmine@gmail.com', 'abcdefg1')
    fireEvent.click(submit())
    expect(screen.getByRole('alert')).toHaveTextContent('Connectez-vous à internet pour vous connecter.')
    expect(signIn).not.toHaveBeenCalled()
  })

  it('succès : Accueil et « Vous êtes connecté »', async () => {
    signIn.mockResolvedValue(undefined)
    setup()
    fill('yasmine@gmail.com', 'abcdefg1')
    await act(async () => { fireEvent.click(submit()) })
    expect(signIn).toHaveBeenCalledWith('yasmine@gmail.com', 'abcdefg1')
    expect(screen.getByText('écran accueil')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(SIGNED_IN_MESSAGE)
  })

  it('le compte change avant la fin de la connexion (application remontée) : Accueil, pas Réglages', async () => {
    let finish: () => void = () => {}
    signIn.mockImplementation(() => new Promise<void>((r) => {
      account = { uid: 'u-mail', email: 'yasmine@gmail.com', isAnonymous: false, refresh: () => {} }
      finish = r
    }))
    const { rerender } = setup()
    fill('yasmine@gmail.com', 'abcdefg1')
    await act(async () => { fireEvent.click(submit()) })
    rerender(tree())
    expect(screen.getByText('écran accueil')).toBeInTheDocument()
    await act(async () => finish())
    expect(screen.getByText('écran accueil')).toBeInTheDocument()
  })

  it('connexion finie, puis écran remonté encore sur /compte/connexion (navigation différée) : Accueil', async () => {
    // Dans l'application, l'ancien écran n'est jamais rendu « connecté » : le nouvel uid le remonte.
    let finish: () => void = () => {}
    signIn.mockImplementation(() => new Promise<void>((r) => { finish = r }))
    setup()
    fill('yasmine@gmail.com', 'abcdefg1')
    await act(async () => { fireEvent.click(submit()) })
    await act(async () => {
      account = { uid: 'u-mail', email: 'yasmine@gmail.com', isAnonymous: false, refresh: () => {} }
      finish()
    })
    const remounted = render(tree())
    expect(within(remounted.container).getByText('écran accueil')).toBeInTheDocument()
  })

  it('double appui : un seul envoi', async () => {
    signIn.mockReturnValue(new Promise(() => {}))
    setup()
    fill('yasmine@gmail.com', 'abcdefg1')
    await act(async () => {
      fireEvent.click(submit())
      fireEvent.click(submit())
    })
    expect(signIn).toHaveBeenCalledTimes(1)
  })

  it.each(['', 'yasmine@'])('mot de passe oublié avec l’adresse « %s » : erreur au champ adresse, rien n’est envoyé', (value) => {
    setup()
    fireEvent.change(email(), { target: { value } })
    fireEvent.click(forgot())
    expect(screen.getByText(RESET_EMAIL_MISSING)).toBeInTheDocument()
    expect(email()).toHaveAttribute('aria-invalid', 'true')
    expect(sendReset).not.toHaveBeenCalled()
  })

  it('mot de passe oublié, double appui : un seul e-mail', async () => {
    sendReset.mockReturnValue(new Promise(() => {}))
    setup()
    fireEvent.change(email(), { target: { value: 'yasmine@gmail.com' } })
    await act(async () => {
      fireEvent.click(forgot())
      fireEvent.click(forgot())
    })
    expect(sendReset).toHaveBeenCalledTimes(1)
  })

  it('mot de passe oublié : e-mail envoyé, message neutre', async () => {
    sendReset.mockResolvedValue(undefined)
    setup()
    fireEvent.change(email(), { target: { value: 'yasmine@gmail.com' } })
    await act(async () => { fireEvent.click(forgot()) })
    expect(sendReset).toHaveBeenCalledWith('yasmine@gmail.com')
    expect(screen.getByText(RESET_SENT)).toBeInTheDocument()
  })

  it('mot de passe oublié pour une adresse sans compte : même message neutre', async () => {
    sendReset.mockRejectedValue({ code: 'auth/user-not-found' })
    setup()
    fireEvent.change(email(), { target: { value: 'inconnu@gmail.com' } })
    await act(async () => { fireEvent.click(forgot()) })
    expect(screen.getByText(RESET_SENT)).toBeInTheDocument()
  })

  describe('focus sur la première erreur (comme le formulaire Dépense)', () => {
    it('adresse et mot de passe vides : focus sur l’adresse', () => {
      setup()
      fireEvent.click(submit())
      expect(email()).toHaveFocus()
    })
    it('adresse ou mot de passe faux (Firebase) : focus sur le mot de passe', async () => {
      signIn.mockRejectedValue({ code: 'auth/invalid-credential' })
      setup()
      fill('yasmine@gmail.com', 'mauvais1')
      await act(async () => { fireEvent.click(submit()) })
      expect(password()).toHaveFocus()
    })
    it('mot de passe oublié sans adresse : focus sur l’adresse', () => {
      setup()
      fireEvent.click(forgot())
      expect(email()).toHaveFocus()
    })
  })

  it('déjà connecté avec un compte e-mail : retour à Réglages', () => {
    account = { uid: 'u-mail', email: 'y@g.co', isAnonymous: false, refresh: () => {} }
    setup()
    expect(screen.getByText('écran réglages')).toBeInTheDocument()
  })
})
