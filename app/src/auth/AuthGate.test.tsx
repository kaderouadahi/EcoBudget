import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'

type Listener = (user: { uid: string; email?: string | null; isAnonymous?: boolean } | null) => void
let listener: Listener | null = null
const signInAnonymously = vi.fn()

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, cb: Listener) => {
    listener = cb
    return () => { listener = null }
  },
  signInAnonymously: (...args: unknown[]) => signInAnonymously(...args),
}))
const { mockAuth } = vi.hoisted(() => ({ mockAuth: { currentUser: null as null | { uid: string; email: string | null; isAnonymous: boolean } } }))
vi.mock('../firebase', () => ({ auth: mockAuth }))

import { useState } from 'react'
import { AuthGate, useAccount, useUid } from './AuthGate'

function ShowUid() {
  return <p>uid={useUid()}</p>
}

function ShowAccount() {
  const { uid, email, isAnonymous, refresh } = useAccount()
  const [clicks, setClicks] = useState(0)
  return (
    <>
      <p>{`compte=${uid} ${email ?? '-'} ${isAnonymous ? 'anonyme' : 'e-mail'}`}</p>
      <button type="button" onClick={() => setClicks(clicks + 1)}>clics={clicks}</button>
      <button type="button" onClick={refresh}>relire</button>
    </>
  )
}

describe('AuthGate', () => {
  beforeEach(() => {
    signInAnonymously.mockReset()
    listener = null
    mockAuth.currentUser = null
  })

  it('compte e-mail : useAccount donne l’adresse et « non anonyme »', async () => {
    render(<AuthGate><ShowAccount /></AuthGate>)
    await act(async () => listener?.({ uid: 'u-mail', email: 'y@g.co', isAnonymous: false }))
    expect(screen.getByText('compte=u-mail y@g.co e-mail')).toBeInTheDocument()
  })

  it('déconnexion : écran de chargement, puis nouveau compte anonyme vide', async () => {
    let resolveAnon: () => void = () => {}
    signInAnonymously.mockImplementation(() => new Promise<void>((r) => { resolveAnon = () => { listener?.({ uid: 'anon-neuf', isAnonymous: true, email: null }); r() } }))
    render(<AuthGate><ShowAccount /></AuthGate>)
    await act(async () => listener?.({ uid: 'u-mail', email: 'y@g.co', isAnonymous: false }))
    await act(async () => listener?.(null))
    expect(screen.queryByText(/compte=/)).not.toBeInTheDocument()
    expect(signInAnonymously).toHaveBeenCalledTimes(1)
    await act(async () => resolveAnon())
    expect(screen.getByText('compte=anon-neuf - anonyme')).toBeInTheDocument()
  })

  it('changement de compte : l’application repart de zéro (rien de l’ancien compte ne reste)', async () => {
    render(<AuthGate><ShowAccount /></AuthGate>)
    await act(async () => listener?.({ uid: 'anon-1', isAnonymous: true, email: null }))
    fireEvent.click(screen.getByRole('button', { name: 'clics=0' }))
    expect(screen.getByRole('button', { name: 'clics=1' })).toBeInTheDocument()
    await act(async () => listener?.({ uid: 'u-mail', email: 'y@g.co', isAnonymous: false }))
    expect(screen.getByRole('button', { name: 'clics=0' })).toBeInTheDocument()
  })

  it('compte créé (lien, même uid) : refresh() relit l’adresse sans remonter l’application', async () => {
    render(<AuthGate><ShowAccount /></AuthGate>)
    await act(async () => listener?.({ uid: 'anon-1', isAnonymous: true, email: null }))
    fireEvent.click(screen.getByRole('button', { name: 'clics=0' }))
    mockAuth.currentUser = { uid: 'anon-1', email: 'y@g.co', isAnonymous: false }
    fireEvent.click(screen.getByRole('button', { name: 'relire' }))
    expect(screen.getByText('compte=anon-1 y@g.co e-mail')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'clics=1' })).toBeInTheDocument()
  })

  it('crée un compte anonyme sans écran et transmet l’uid', async () => {
    signInAnonymously.mockImplementation(async () => {
      listener?.({ uid: 'anon-1' })
    })
    render(<AuthGate><ShowUid /></AuthGate>)
    await act(async () => listener?.(null))
    expect(signInAnonymously).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('uid=anon-1')).toBeInTheDocument()
  })

  it('réutilise un compte existant sans en recréer', async () => {
    render(<AuthGate><ShowUid /></AuthGate>)
    await act(async () => listener?.({ uid: 'deja-la' }))
    expect(signInAnonymously).not.toHaveBeenCalled()
    expect(screen.getByText('uid=deja-la')).toBeInTheDocument()
  })

  describe('réseau annoncé mais inutilisable', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('réessaie tout seul toutes les 10 s', async () => {
      signInAnonymously.mockRejectedValue(Object.assign(new Error('x'), { code: 'auth/network-request-failed' }))
      render(<AuthGate><ShowUid /></AuthGate>)
      await act(async () => listener?.(null))
      expect(signInAnonymously).toHaveBeenCalledTimes(1)
      signInAnonymously.mockImplementation(async () => { listener?.({ uid: 'anon-3' }) })
      await act(async () => { vi.advanceTimersByTime(10_000) })
      expect(signInAnonymously).toHaveBeenCalledTimes(2)
      expect(screen.getByText('uid=anon-3')).toBeInTheDocument()
    })
  })

  it('bouton « Réessayer » relance la création du compte', async () => {
    signInAnonymously.mockRejectedValueOnce(Object.assign(new Error('x'), { code: 'auth/network-request-failed' }))
    render(<AuthGate><ShowUid /></AuthGate>)
    await act(async () => listener?.(null))
    signInAnonymously.mockImplementation(async () => { listener?.({ uid: 'anon-4' }) })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Réessayer' })) })
    expect(await screen.findByText('uid=anon-4')).toBeInTheDocument()
  })

  it('erreur autre que réseau : message générique, pas « connectez-vous à internet »', async () => {
    signInAnonymously.mockRejectedValueOnce(Object.assign(new Error('x'), { code: 'auth/too-many-requests' }))
    render(<AuthGate><ShowUid /></AuthGate>)
    await act(async () => listener?.(null))
    expect(await screen.findByText(/Impossible de démarrer EcoBudget pour le moment/)).toBeInTheDocument()
    expect(screen.queryByText(/connectez-vous à internet/i)).not.toBeInTheDocument()
  })

  it('hors connexion à la première ouverture : message puis nouvel essai au retour du réseau', async () => {
    signInAnonymously.mockRejectedValueOnce(Object.assign(new Error('x'), { code: 'auth/network-request-failed' }))
    render(<AuthGate><ShowUid /></AuthGate>)
    await act(async () => listener?.(null))
    expect(await screen.findByText(/connectez-vous à internet une fois pour commencer/i)).toBeInTheDocument()

    signInAnonymously.mockImplementation(async () => { listener?.({ uid: 'anon-2' }) })
    await act(async () => { window.dispatchEvent(new Event('online')) })
    expect(signInAnonymously).toHaveBeenCalledTimes(2)
    expect(await screen.findByText('uid=anon-2')).toBeInTheDocument()
  })
})
