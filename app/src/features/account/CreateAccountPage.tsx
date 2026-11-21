import { Cloud, UserRound } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { createAccount } from '../../auth/actions'
import { useAccount } from '../../auth/AuthGate'
import { useData } from '../../data/DataProvider'
import { setUserFields } from '../../data/repo'
import {
  authProblem, CREATED_MESSAGE, EMAIL_INCOMPLETE, isEmailComplete, NETWORK_CODE, passwordChecks, PASSWORD_RULE,
  type AuthProblem,
} from '../../lib/account'
import { cleanFirstName, FIRST_NAME_MAX } from '../../lib/settings'
import { useToast } from '../../ui/Toast'
import { AccountHeader, FormProblem, PasswordField } from './parts'
import '../expenses/ExpenseForm.css'
import './account.css'

/**
 * Créer un compte (H9, maquettes telephone-10 / ordinateur-09) : le compte anonyme de l'appareil
 * devient un compte e-mail ; ce qui est déjà noté est conservé (DECISIONS.md 21/11).
 */
export function CreateAccountPage() {
  // Écran ouvert directement (rechargement, application rouverte) : attendre les données pour préremplir le prénom.
  const { ready } = useData()
  return ready ? <CreateAccountForm /> : null
}

function CreateAccountForm() {
  const { uid, isAnonymous, refresh } = useAccount()
  const { user } = useData()
  const navigate = useNavigate()
  const { show } = useToast()
  const ids = useId()
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tried, setTried] = useState(false)
  const [emailProblem, setEmailProblem] = useState<AuthProblem | null>(null)
  const [passwordProblem, setPasswordProblem] = useState<string | null>(null)
  const [formProblem, setFormProblem] = useState<AuthProblem | null>(null)
  const [busy, setBusy] = useState(false)
  const sending = useRef(false)

  if (!isAnonymous) return <Navigate to="/reglages" replace />

  const checks = passwordChecks(password)
  const allMet = checks.length && checks.digit

  async function submit(e?: FormEvent) {
    e?.preventDefault()
    if (sending.current) return
    setTried(true)
    const emailOk = isEmailComplete(email)
    setEmailProblem(emailOk ? null : { field: 'email', message: EMAIL_INCOMPLETE })
    setPasswordProblem(allMet ? null : PASSWORD_RULE)
    setFormProblem(null)
    if (!emailOk || !allMet) return
    if (!navigator.onLine) {
      setFormProblem(authProblem('create', NETWORK_CODE))
      return
    }
    sending.current = true
    setBusy(true)
    try {
      await createAccount(email, password)
    } catch (err) {
      const p = authProblem('create', (err as { code?: string } | null)?.code)
      if (p?.field === 'email') setEmailProblem(p)
      else if (p?.field === 'password') setPasswordProblem(p.message)
      else setFormProblem(p)
      sending.current = false
      setBusy(false)
      return
    }
    refresh()
    const next = cleanFirstName(firstName)
    if ((next ?? '') !== (user?.firstName ?? '')) setUserFields(uid, { firstName: next })
    navigate('/reglages', { replace: true })
    show({ message: CREATED_MESSAGE })
  }

  return (
    <form className="account-page" onSubmit={submit} noValidate>
      <AccountHeader title="Créer un compte" subtitle="Facultatif" />

      <div className="account-banner">
        <span className="round-icon"><Cloud aria-hidden size={22} /></span>
        <p>Retrouvez vos dépenses sur tous vos appareils. <strong>Ce que vous avez déjà noté est conservé.</strong></p>
      </div>

      <div className="field">
        <label htmlFor={`${ids}-first`}>Prénom (facultatif)</label>
        <input
          id={`${ids}-first`}
          className="text-input"
          autoComplete="given-name"
          maxLength={FIRST_NAME_MAX}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          aria-describedby={`${ids}-first-help`}
        />
        <p id={`${ids}-first-help`} className="field-help">Affiché sur l'accueil</p>
      </div>

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
          aria-invalid={emailProblem ? 'true' : 'false'}
          aria-describedby={emailProblem ? `${ids}-email-err` : undefined}
        />
        {emailProblem && (
          <p id={`${ids}-email-err`} className="field-error">
            {emailProblem.message}
            {emailProblem.kind === 'exists' && (
              <> <Link to="/compte/connexion" state={{ email: email.trim() }}>Se connecter</Link></>
            )}
          </p>
        )}
      </div>

      <PasswordField
        id={`${ids}-password`}
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        error={passwordProblem ?? undefined}
        showCheckErrors={tried}
        checks={[
          { label: 'Au moins 8 caractères', met: checks.length },
          { label: 'Au moins un chiffre', met: checks.digit },
        ]}
      />

      {formProblem && <FormProblem message={formProblem.message} onRetry={formProblem.kind === 'retry' ? () => submit() : undefined} />}

      <button type="submit" className="primary-button account-submit" disabled={busy}>
        <UserRound aria-hidden size={20} />
        Créer mon compte
      </button>

      <p className="account-alt">J'ai déjà un compte. <Link to="/compte/connexion">Se connecter</Link></p>
    </form>
  )
}
