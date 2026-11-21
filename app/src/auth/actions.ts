import { EmailAuthProvider, linkWithCredential, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { waitForPendingWrites } from 'firebase/firestore'
import { auth, db } from '../firebase'

// Compte e-mail facultatif (HANDOFF H9) : appels Firebase seulement ; règles et textes dans lib/account.ts.

/** Le compte anonyme de l'appareil devient un compte e-mail : même uid, rien n'est copié ni perdu. */
export async function createAccount(email: string, password: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw Object.assign(new Error('pas de compte courant'), { code: 'auth/internal-error' })
  await linkWithCredential(user, EmailAuthProvider.credential(email.trim(), password))
}

/** Rejoint un compte existant ; les données du compte anonyme de l'appareil ne suivent pas (DECISIONS.md 21/11). */
export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password)
}

export async function sendReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim())
}

/**
 * Déconnexion sans jamais perdre une écriture en attente (HANDOFF H9) : refusée hors connexion,
 * ou si les dernières écritures n'ont pas atteint le serveur dans le délai.
 */
export async function signOutSafely(timeoutMs = 10_000): Promise<'ok' | 'offline'> {
  if (!navigator.onLine) return 'offline'
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<'timeout'>((resolve) => { timer = setTimeout(() => resolve('timeout'), timeoutMs) })
  // Deux attentes : la seconde couvre une écriture faite pendant la première (dépense notée pendant « Déconnexion… »).
  const pending = waitForPendingWrites(db).then(() => waitForPendingWrites(db))
  const sent = await Promise.race([pending.then(() => 'sent' as const), timeout])
  clearTimeout(timer)
  if (sent === 'timeout') return 'offline'
  await signOut(auth)
  return 'ok'
}
