// Compte e-mail facultatif (HANDOFF H9, DECISIONS.md 21/11) : règles et textes, sans Firebase.

export const PASSWORD_MIN = 8

export const EMAIL_INCOMPLETE = 'Adresse incomplète : ajoutez la fin, par exemple yasmine@gmail.com'
export const EMAIL_EXISTS = 'Un compte existe déjà avec cette adresse.'
export const PASSWORD_RULE = 'Le mot de passe doit contenir au moins 8 caractères, dont un chiffre.'
export const SIGNIN_WRONG = 'Adresse e-mail ou mot de passe incorrect.'
export const TOO_MANY_SIGNIN = "Trop d'essais. Réessayez dans quelques minutes, ou utilisez « Mot de passe oublié ? »."
export const RESET_EMAIL_MISSING = 'Saisissez votre adresse e-mail pour recevoir le lien.'
export const RESET_SENT = "Si un compte existe pour cette adresse, un e-mail vient d'être envoyé pour choisir un nouveau mot de passe."
export const PASSWORD_MISSING = 'Saisissez votre mot de passe.'
export const SIGNOUT_OFFLINE = "Connectez-vous à internet pour vous déconnecter : vos dernières dépenses doivent d'abord être enregistrées dans votre compte."
/** Message long (environ 125 caractères) : affiché au moins 8 s pour avoir le temps de le lire. */
export const SIGNOUT_OFFLINE_MS = 8000
export const CREATED_MESSAGE = 'Compte créé : vos données sont enregistrées dans votre compte.'
export const SIGNED_IN_MESSAGE = 'Vous êtes connecté'
export const SIGNED_OUT_MESSAGE = 'Vous êtes déconnecté'
export const NETWORK_CODE = 'auth/network-request-failed'

/** Conditions affichées sous le champ Mot de passe, remplies ou non pendant la saisie (C1). */
export function passwordChecks(pw: string): { length: boolean; digit: boolean } {
  return { length: pw.length >= PASSWORD_MIN, digit: /[0-9]/.test(pw) }
}

export function isEmailComplete(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export type AuthAction = 'create' | 'signin' | 'reset'

export interface AuthProblem {
  field: 'email' | 'password' | 'form'
  message: string
  /** 'exists' : lien « Se connecter » ; 'retry' : bouton « Réessayer ». */
  kind?: 'exists' | 'retry'
}

const OFFLINE: Record<AuthAction, string> = {
  create: 'Connectez-vous à internet pour créer votre compte.',
  signin: 'Connectez-vous à internet pour vous connecter.',
  reset: 'Connectez-vous à internet pour recevoir le lien.',
}
const GENERAL: Record<AuthAction, string> = {
  create: "Le compte n'a pas pu être créé.",
  signin: "La connexion n'a pas abouti.",
  reset: "L'e-mail n'a pas pu être envoyé.",
}

/** Message à afficher, au bon champ, pour un code d'erreur Firebase (C5). null : rien à signaler. */
export function authProblem(action: AuthAction, code: string | undefined): AuthProblem | null {
  if (code === NETWORK_CODE) return { field: 'form', message: OFFLINE[action] }
  if (action === 'create') {
    if (code === 'auth/email-already-in-use' || code === 'auth/credential-already-in-use') {
      return { field: 'email', message: EMAIL_EXISTS, kind: 'exists' }
    }
    if (code === 'auth/invalid-email') return { field: 'email', message: EMAIL_INCOMPLETE }
    if (code === 'auth/weak-password') return { field: 'password', message: PASSWORD_RULE }
  }
  if (action === 'signin') {
    // Firebase ne dit pas lequel des deux est faux : un seul message (DECISIONS.md 21/11).
    if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials'
      || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return { field: 'password', message: SIGNIN_WRONG }
    }
    if (code === 'auth/too-many-requests') return { field: 'password', message: TOO_MANY_SIGNIN }
    if (code === 'auth/invalid-email') return { field: 'email', message: EMAIL_INCOMPLETE }
  }
  if (action === 'reset') {
    // Message neutre, que l'adresse ait un compte ou non.
    if (code === 'auth/user-not-found') return null
    if (code === 'auth/invalid-email' || code === 'auth/missing-email') return { field: 'email', message: RESET_EMAIL_MISSING }
    if (code === 'auth/too-many-requests') return { field: 'form', message: "Trop d'essais. Réessayez dans quelques minutes." }
  }
  return { field: 'form', message: GENERAL[action], kind: 'retry' }
}

export interface Segment { text: string; strong?: boolean }

/** Avertissement avant de se connecter : les dépenses notées sans compte ne suivent pas (DECISIONS.md 21/11). */
export function deviceWarning(count: number): Segment[] | null {
  if (count <= 0) return null
  const one = count === 1
  return [
    { text: 'Cet appareil contient ' },
    { text: one ? '1 dépense' : `${count} dépenses`, strong: true },
    { text: one ? ' notée sans compte. Elle ' : ' notées sans compte. Elles ' },
    { text: one ? 'ne sera pas ajoutée' : 'ne seront pas ajoutées', strong: true },
    { text: one ? ' à votre compte et ne sera plus visible ici.' : ' à votre compte et ne seront plus visibles ici.' },
  ]
}
