import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'

type Listener = (user: { uid: string } | null) => void
let listener: Listener | null = null
const signInAnonymously = vi.fn()

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, cb: Listener) => {
    listener = cb
    return () => { listener = null }
  },
  signInAnonymously: (...args: unknown[]) => signInAnonymously(...args),
}))
vi.mock('../firebase', () => ({ auth: {} }))

import { AuthGate, useUid } from './AuthGate'

function ShowUid() {
  return <p>uid={useUid()}</p>
}

describe('AuthGate', () => {
  beforeEach(() => {
    signInAnonymously.mockReset()
    listener = null
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
