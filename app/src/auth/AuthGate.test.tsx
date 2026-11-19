import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

  it('hors connexion à la première ouverture : message puis nouvel essai au retour du réseau', async () => {
    signInAnonymously.mockRejectedValueOnce(new Error('auth/network-request-failed'))
    render(<AuthGate><ShowUid /></AuthGate>)
    await act(async () => listener?.(null))
    expect(await screen.findByText(/connectez-vous à internet une fois pour commencer/i)).toBeInTheDocument()

    signInAnonymously.mockImplementation(async () => { listener?.({ uid: 'anon-2' }) })
    await act(async () => { window.dispatchEvent(new Event('online')) })
    expect(signInAnonymously).toHaveBeenCalledTimes(2)
    expect(await screen.findByText('uid=anon-2')).toBeInTheDocument()
  })
})
