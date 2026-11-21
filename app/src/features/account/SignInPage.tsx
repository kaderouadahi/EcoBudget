import { Smartphone } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { sendReset, signIn } from '../../auth/actions'
import { useAccount } from '../../auth/AuthGate'
import { useData } from '../../data/DataProvider'
import {
  authProblem, deviceWarning, EMAIL_INCOMPLETE, isEmailComplete, NETWORK_CODE, PASSWORD_MISSING, RESET_EMAIL_MISSING,
  RESET_SENT, SIGNED_IN_MESSAGE, type AuthProblem,
} from '../../lib/account'
import { useToast } from '../../ui/Toast'
import { AccountHeader, FormProblem, PasswordField } from './parts'
import '../expenses/ExpenseForm.css'
import './account.css'

const codeOf = (err: unknown) => (err as { code?: string } | null)?.code

// Connexion en cours : le changement de compte remonte toute l'application (AuthGate) avant la fin de signIn.
// L'écran remonté, déjà connecté, doit alors mener à l'Accueil et non à Réglages.
let signingIn = false

/**
 * Se connecter (H9, maquettes telephone-11 / ordinateur-10) : rejoindre un compte existant.
 * Les dépenses notées sans compte ne suivent pas : c'est annoncé avant d'agir (DECISIONS.md 21/11, C5).
 */
export function SignInPage() {
  const { isAnonymous } = useAccount()
  const { expenses } = useData()
  const navigate = useNavigate()
  const { show } = useToast()
  const { state } = useLocation()
  const ids = useId()
  const [email, setEmail] = useState((state as { email?: string } | null)?.email ?? '')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [formProblem, setFormProblem] = useState<AuthProblem | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const sending = useRef(false)
  // Destination fixée la première fois que l'écran voit le compte connecté : la navigation de react-router
  // est différée (transition), l'écran remonté peut se rendre encore sur /compte/connexion après la fin de signIn.
  const redirect = useRef<string | null>(null)
  if (!isAnonymous && redirect.current === null) redirect.current = signingIn ? '/' : '/reglages'
  // Le drapeau est consommé une fois la destination fixée ; un écran ouvert sans compte n'a aucune connexion en cours.
  useEffect(() => { signingIn = false }, [isAnonymous])

  if (!isAnonymous) return <Navigate to={redirect.current ?? '/reglages'} replace />

  const warning = deviceWarning(expenses.length)

  function showProblem(p: AuthProblem | null) {
    if (p?.field === 'email') setEmailError(p.message)
    else if (p?.field === 'password') setPasswordError(p.message)
    else setFormProblem(p)
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault()
    if (sending.current) return
    const emailOk = isEmailComplete(email)
    setEmailError(emailOk ? null : EMAIL_INCOMPLETE)
    setPasswordError(password ? null : PASSWORD_MISSING)
    setFormProblem(null)
    setResetSent(false)
    if (!emailOk || !password) return
    if (!navigator.onLine) {
      setFormProblem(authProblem('signin', NETWORK_CODE))
      return
    }
    sending.current = true
    signingIn = true
    setBusy(true)
    try {
      await signIn(email, password)
    } catch (err) {
      signingIn = false
      showProblem(authProblem('signin', codeOf(err)))
      sending.current = false
      setBusy(false)
      return
    }
    // Le compte change : AuthGate remonte l'application ; la navigation et le message restent (H9).
    navigate('/', { replace: true })
    show({ message: SIGNED_IN_MESSAGE })
  }

  async function forgotPassword() {
    setFormProblem(null)
    setPasswordError(null)
    setResetSent(false)
    if (!isEmailComplete(email)) {
      setEmailError(RESET_EMAIL_MISSING)
      return
    }
    setEmailError(null)
    if (!navigator.onLine) {
      setFormProblem(authProblem('reset', NETWORK_CODE))
      return
    }
    try {
      await sendReset(email)
    } catch (err) {
      const p = authProblem('reset', codeOf(err))
      if (p) {
        showProblem(p)
        return
      }
    }
    setResetSent(true)
  }

  return (
    <form className="account-page" onSubmit={submit} noValidate>
      <AccountHeader title="Se connecter" subtitle="Retrouvez vos données" />

      <div className="field">
        <label htmlFor={`${ids}-email`}>Adresse e-mail</label>
        <input
          id={`${ids}-email`}
          className="text-input"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={emailError ? 'true' : 'false'}
          aria-describedby={emailError ? `${ids}-email-err` : undefined}
        />
        {emailError && <p id={`${ids}-email-err`} className="field-error">{emailError}</p>}
      </div>

      <PasswordField
        id={`${ids}-password`}
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        error={passwordError ?? undefined}
      />

      <button type="button" className="text-link account-forgot" onClick={forgotPassword}>Mot de passe oublié ?</button>
      <p className="form-note" aria-live="polite" hidden={!resetSent}>{resetSent ? RESET_SENT : ''}</p>

      {formProblem && <FormProblem message={formProblem.message} onRetry={formProblem.kind === 'retry' ? () => submit() : undefined} />}

      {warning && (
        <div className="device-warning">
          <Smartphone aria-hidden size={22} />
          <p>{warning.map((s, i) => (s.strong ? <strong key={i}>{s.text}</strong> : <span key={i}>{s.text}</span>))}</p>
        </div>
      )}
      <button type="submit" className="primary-button account-submit" disabled={busy}>Se connecter</button>

      <p className="account-alt">Pas encore de compte ? <Link to="/compte/creer">Créer un compte</Link></p>
    </form>
  )
}
