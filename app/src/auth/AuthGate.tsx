import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { auth } from '../firebase'
import './AuthGate.css'

const UidContext = createContext<string | null>(null)

/** uid de l'utilisateur courant (anonyme ou connecté). Utilisable sous <AuthGate>. */
export function useUid(): string {
  const uid = useContext(UidContext)
  if (!uid) throw new Error('useUid doit être utilisé sous <AuthGate>')
  return uid
}

type State = { kind: 'loading' } | { kind: 'offline' } | { kind: 'ready'; uid: string }

/**
 * Compte anonyme créé à la première ouverture, sans aucun écran (DECISIONS.md 17/11, C2).
 * Seule exception : la toute première ouverture sans réseau.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false
    const tryAnonymous = () => {
      signInAnonymously(auth).catch(() => {
        if (!cancelled) setState({ kind: 'offline' })
      })
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setState({ kind: 'ready', uid: user.uid })
      else tryAnonymous()
    })
    const onOnline = () => {
      if (!auth.currentUser) tryAnonymous()
    }
    window.addEventListener('online', onOnline)
    return () => {
      cancelled = true
      unsubscribe()
      window.removeEventListener('online', onOnline)
    }
  }, [])

  if (state.kind === 'ready') {
    return <UidContext.Provider value={state.uid}>{children}</UidContext.Provider>
  }
  if (state.kind === 'offline') {
    return (
      <main className="auth-gate" role="alert">
        <h1>EcoBudget</h1>
        <p>
          Première ouverture : connectez-vous à internet une fois pour commencer. Vos dépenses
          seront ensuite enregistrées même sans réseau.
        </p>
        <p className="auth-gate-hint">L'application reprendra toute seule dès que le réseau revient.</p>
      </main>
    )
  }
  return <main className="auth-gate" aria-busy="true"><h1>EcoBudget</h1></main>
}
