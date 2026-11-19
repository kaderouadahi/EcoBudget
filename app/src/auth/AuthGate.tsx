import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { auth } from '../firebase'
import './AuthGate.css'

const UidContext = createContext<string | null>(null)

/** uid de l'utilisateur courant (anonyme ou connecté). Utilisable sous <AuthGate>. */
export function useUid(): string {
  const uid = useContext(UidContext)
  if (!uid) throw new Error('useUid doit être utilisé sous <AuthGate>')
  return uid
}

export const RETRY_MS = 10_000

type State =
  | { kind: 'loading' }
  | { kind: 'failed'; network: boolean }
  | { kind: 'ready'; uid: string }

/**
 * Compte anonyme créé à la première ouverture, sans aucun écran (DECISIONS.md 17/11, C2).
 * Seule exception : l'échec de cette création (pas de réseau, quota…), expliqué avec un
 * nouvel essai automatique et un bouton « Réessayer » (C1, C5).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ kind: 'loading' })
  const tryRef = useRef<() => void>(() => {})

  useEffect(() => {
    let cancelled = false
    tryRef.current = () => {
      if (auth.currentUser) return
      signInAnonymously(auth).catch((e: { code?: string }) => {
        if (!cancelled) setState({ kind: 'failed', network: e?.code === 'auth/network-request-failed' })
      })
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setState({ kind: 'ready', uid: user.uid })
      else tryRef.current()
    })
    const onOnline = () => tryRef.current()
    window.addEventListener('online', onOnline)
    return () => {
      cancelled = true
      unsubscribe()
      window.removeEventListener('online', onOnline)
    }
  }, [])

  // Réseau annoncé mais inutilisable (portail captif, forfait épuisé) : l'événement online ne viendra pas.
  const failed = state.kind === 'failed'
  useEffect(() => {
    if (!failed) return
    const id = setInterval(() => tryRef.current(), RETRY_MS)
    return () => clearInterval(id)
  }, [failed])

  const retry = useCallback(() => tryRef.current(), [])

  if (state.kind === 'ready') {
    return <UidContext.Provider value={state.uid}>{children}</UidContext.Provider>
  }
  if (state.kind === 'failed') {
    return (
      <main className="auth-gate" role="alert">
        <h1>EcoBudget</h1>
        {state.network ? (
          <p>
            Première ouverture : connectez-vous à internet une fois pour commencer. Vos dépenses
            seront ensuite enregistrées même sans réseau.
          </p>
        ) : (
          <p>Impossible de démarrer EcoBudget pour le moment. Réessayez dans quelques instants.</p>
        )}
        <button type="button" className="auth-gate-retry" onClick={retry}>Réessayer</button>
        <p className="auth-gate-hint">L'application réessaie aussi toute seule.</p>
      </main>
    )
  }
  return <main className="auth-gate" aria-busy="true"><h1>EcoBudget</h1></main>
}
