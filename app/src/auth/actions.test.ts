import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const linkWithCredential = vi.fn(async () => ({}))
const credential = vi.fn((email: string, password: string) => ({ email, password }))
const signInWithEmailAndPassword = vi.fn(async () => ({}))
const sendPasswordResetEmail = vi.fn(async () => {})
const signOut = vi.fn(async () => {})
let pending: Promise<void> = Promise.resolve()
const waitForPendingWrites = vi.fn(() => pending)

vi.mock('firebase/auth', () => ({
  EmailAuthProvider: { credential: (e: string, p: string) => credential(e, p) },
  linkWithCredential: (...a: unknown[]) => linkWithCredential(...(a as [])),
  signInWithEmailAndPassword: (...a: unknown[]) => signInWithEmailAndPassword(...(a as [])),
  sendPasswordResetEmail: (...a: unknown[]) => sendPasswordResetEmail(...(a as [])),
  signOut: (...a: unknown[]) => signOut(...(a as [])),
}))
vi.mock('firebase/firestore', () => ({ waitForPendingWrites: () => waitForPendingWrites() }))
const { auth } = vi.hoisted(() => ({ auth: { currentUser: { uid: 'anon-1' } } }))
vi.mock('../firebase', () => ({ auth, db: {} }))

import { createAccount, sendReset, signIn, signOutSafely } from './actions'

const setOnline = (on: boolean) => vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(on)

describe('actions du compte', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pending = Promise.resolve()
    setOnline(true)
  })
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers() })

  it('créer un compte relie le compte anonyme, adresse sans espaces', async () => {
    await createAccount('  Yasmine@gmail.com ', 'abcdefg1')
    expect(credential).toHaveBeenCalledWith('Yasmine@gmail.com', 'abcdefg1')
    expect(linkWithCredential).toHaveBeenCalledWith(auth.currentUser, { email: 'Yasmine@gmail.com', password: 'abcdefg1' })
  })

  it('se connecter et mot de passe oublié : adresse sans espaces', async () => {
    await signIn(' y@g.co ', 'pw')
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'y@g.co', 'pw')
    await sendReset(' y@g.co ')
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'y@g.co')
  })

  it('déconnexion refusée hors connexion, sans rien appeler', async () => {
    setOnline(false)
    expect(await signOutSafely()).toBe('offline')
    expect(waitForPendingWrites).not.toHaveBeenCalled()
    expect(signOut).not.toHaveBeenCalled()
  })

  it('écritures en attente qui ne partent pas en 10 s : refusée, pas de déconnexion', async () => {
    vi.useFakeTimers()
    pending = new Promise(() => {})
    const result = signOutSafely()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(await result).toBe('offline')
    expect(signOut).not.toHaveBeenCalled()
  })

  it('écritures faites pendant l’attente (dépense notée pendant « Déconnexion… ») : attendues aussi avant de se déconnecter', async () => {
    let second: () => void = () => {}
    waitForPendingWrites
      .mockImplementationOnce(() => Promise.resolve())
      .mockImplementationOnce(() => new Promise<void>((r) => { second = r }))
    const result = signOutSafely()
    await vi.waitFor(() => expect(waitForPendingWrites).toHaveBeenCalledTimes(2))
    expect(signOut).not.toHaveBeenCalled()
    second()
    expect(await result).toBe('ok')
    expect(signOut).toHaveBeenCalledTimes(1)
  })

  it('écritures envoyées : déconnexion', async () => {
    expect(await signOutSafely()).toBe('ok')
    expect(waitForPendingWrites).toHaveBeenCalled()
    expect(signOut).toHaveBeenCalledWith(auth)
  })
})
