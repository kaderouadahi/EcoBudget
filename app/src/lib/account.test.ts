import { describe, expect, it } from 'vitest'
import {
  authProblem, deviceWarning, EMAIL_EXISTS, EMAIL_INCOMPLETE, isEmailComplete, passwordChecks, PASSWORD_RULE,
  RESET_EMAIL_MISSING, SIGNIN_WRONG, TOO_MANY_SIGNIN,
} from './account'

describe('conditions du mot de passe', () => {
  it('7 caractères avec un chiffre : longueur non remplie', () => {
    expect(passwordChecks('abc1234')).toEqual({ length: false, digit: true })
  })
  it('8 caractères sans chiffre : chiffre non rempli', () => {
    expect(passwordChecks('abcdefgh')).toEqual({ length: true, digit: false })
  })
  it('8 caractères avec un chiffre : tout est rempli', () => {
    expect(passwordChecks('abcdefg1')).toEqual({ length: true, digit: true })
  })
})

describe('adresse e-mail complète', () => {
  it.each(['yasmine@', 'yasmine@gmail', '', 'yas mine@gmail.com', '@gmail.com'])('« %s » est incomplète', (e) => {
    expect(isEmailComplete(e)).toBe(false)
  })
  it('espaces de début et de fin ignorés', () => {
    expect(isEmailComplete(' yasmine@gmail.com ')).toBe(true)
  })
})

describe('messages selon les erreurs Firebase', () => {
  const NET_CREATE = { field: 'form', message: 'Connectez-vous à internet pour créer votre compte.' }
  const NET_SIGNIN = { field: 'form', message: 'Connectez-vous à internet pour vous connecter.' }

  it.each([
    ['auth/email-already-in-use', { field: 'email', message: EMAIL_EXISTS, kind: 'exists' }],
    ['auth/credential-already-in-use', { field: 'email', message: EMAIL_EXISTS, kind: 'exists' }],
    ['auth/invalid-email', { field: 'email', message: EMAIL_INCOMPLETE }],
    ['auth/weak-password', { field: 'password', message: PASSWORD_RULE }],
    ['auth/network-request-failed', NET_CREATE],
    ['auth/internal-error', { field: 'form', message: "Le compte n'a pas pu être créé.", kind: 'retry' }],
  ])('création, %s', (code, expected) => {
    expect(authProblem('create', code)).toEqual(expected)
  })

  it.each([
    ['auth/invalid-credential', { field: 'password', message: SIGNIN_WRONG }],
    ['auth/invalid-login-credentials', { field: 'password', message: SIGNIN_WRONG }],
    ['auth/wrong-password', { field: 'password', message: SIGNIN_WRONG }],
    ['auth/user-not-found', { field: 'password', message: SIGNIN_WRONG }],
    ['auth/too-many-requests', { field: 'password', message: TOO_MANY_SIGNIN }],
    ['auth/invalid-email', { field: 'email', message: EMAIL_INCOMPLETE }],
    ['auth/network-request-failed', NET_SIGNIN],
    ['auth/internal-error', { field: 'form', message: "La connexion n'a pas abouti.", kind: 'retry' }],
  ])('connexion, %s', (code, expected) => {
    expect(authProblem('signin', code)).toEqual(expected)
  })

  it.each([
    ['auth/invalid-email', { field: 'email', message: RESET_EMAIL_MISSING }],
    ['auth/missing-email', { field: 'email', message: RESET_EMAIL_MISSING }],
    ['auth/network-request-failed', { field: 'form', message: 'Connectez-vous à internet pour recevoir le lien.' }],
    ['auth/too-many-requests', { field: 'form', message: "Trop d'essais. Réessayez dans quelques minutes." }],
    ['auth/internal-error', { field: 'form', message: "L'e-mail n'a pas pu être envoyé.", kind: 'retry' }],
  ])('mot de passe oublié, %s', (code, expected) => {
    expect(authProblem('reset', code)).toEqual(expected)
  })

  it('mot de passe oublié pour une adresse sans compte : pas d’erreur (message neutre)', () => {
    expect(authProblem('reset', 'auth/user-not-found')).toBeNull()
  })

  it('textes exacts de la spec', () => {
    expect(EMAIL_INCOMPLETE).toBe('Adresse incomplète : ajoutez la fin, par exemple yasmine@gmail.com')
    expect(EMAIL_EXISTS).toBe('Un compte existe déjà avec cette adresse.')
    expect(PASSWORD_RULE).toBe('Le mot de passe doit contenir au moins 8 caractères, dont un chiffre.')
    expect(SIGNIN_WRONG).toBe('Adresse e-mail ou mot de passe incorrect.')
    expect(TOO_MANY_SIGNIN).toBe("Trop d'essais. Réessayez dans quelques minutes, ou utilisez « Mot de passe oublié ? ».")
    expect(RESET_EMAIL_MISSING).toBe('Saisissez votre adresse e-mail pour recevoir le lien.')
  })
})

describe('avertissement « dépenses notées sans compte »', () => {
  const joined = (n: number) => deviceWarning(n)?.map((s) => s.text).join('')
  const bold = (n: number) => deviceWarning(n)?.filter((s) => s.strong).map((s) => s.text)

  it('aucune dépense : pas d’avertissement', () => {
    expect(deviceWarning(0)).toBeNull()
  })
  it('plusieurs dépenses : pluriel', () => {
    expect(joined(2)).toBe('Cet appareil contient 2 dépenses notées sans compte. Elles ne seront pas ajoutées à votre compte et ne seront plus visibles ici.')
    expect(bold(2)).toEqual(['2 dépenses', 'ne seront pas ajoutées'])
  })
  it('une seule dépense : singulier', () => {
    expect(joined(1)).toBe('Cet appareil contient 1 dépense notée sans compte. Elle ne sera pas ajoutée à votre compte et ne sera plus visible ici.')
    expect(bold(1)).toEqual(['1 dépense', 'ne sera pas ajoutée'])
  })
})
