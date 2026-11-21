import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { auth } from '../firebase'
import './AuthGate.css'

/** Compte courant (H9) : anonyme, ou compte e-mail. */
export interface Account {
  uid: string
  email: string | null
  isAnonymous: boolean
  /** Relit le compte courant (après la création d'un compte : même uid, onAuthStateChanged ne se déclenche pas). */
  refresh: () => void
}

const AccountContext = createContext<Account | null>(null)

/** uid de l'utilisateur courant (anonyme ou connecté). Utilisable sous <AuthGate>. */
export function useUid(): string {
  const account = useContext(AccountContext)
  if (!account) throw new Error('useUid doit être utilisé sous <AuthGate>')
  return account.uid
}

export function useAccount(): Account {
  const account = useContext(AccountContext)
  if (!account) throw new Error('useAccount doit être utilisé sous <AuthGate>')
  return account
}

export const RETRY_MS = 10_000

interface AuthUser { uid: string; email?: string | null; isAnonymous?: boolean }

type State =
  | { kind: 'loading' }
  | { kind: 'failed'; network: boolean }
  | { kind: 'ready'; uid: string; email: string | null; isAnonymous: boolean }

const ready = (u: AuthUser): State => ({ kind: 'ready', uid: u.uid, email: u.email ?? null, isAnonymous: u.isAnonymous !== false })

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
      if (user) setState(ready(user))
      else {
        // Déconnexion (H9) : rien de l'ancien compte ne reste affiché ni abonné ; un nouveau compte anonyme vide suit.
        setState((s) => (s.kind === 'ready' ? { kind: 'loading' } : s))
        tryRef.current()
      }
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
  const refresh = useCallback(() => {
    const user = auth.currentUser
    if (user) setState(ready(user))
  }, [])

  const readyUid = state.kind === 'ready' ? state.uid : null
  const readyEmail = state.kind === 'ready' ? state.email : null
  const readyAnonymous = state.kind === 'ready' ? state.isAnonymous : true
  const account = useMemo<Account | null>(
    () => (readyUid ? { uid: readyUid, email: readyEmail, isAnonymous: readyAnonymous, refresh } : null),
    [readyUid, readyEmail, readyAnonymous, refresh],
  )

  if (account) {
    // Autre compte (connexion, déconnexion) : toute l'application repart de zéro (données, abonnements, écrans).
    return (
      <AccountContext.Provider value={account}>
        <Fragment key={account.uid}>{children}</Fragment>
      </AccountContext.Provider>
    )
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
