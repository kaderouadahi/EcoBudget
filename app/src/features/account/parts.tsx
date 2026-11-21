import { ChevronLeft, Circle, CircleAlert, CircleCheck } from 'lucide-react'
import { useState } from 'react'
import { useClose } from '../expenses/useClose'

/** En-tête des écrans de compte (maquettes telephone-10 et 11) : retour, titre, sous-titre. */
export function AccountHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const close = useClose()
  return (
    <header className="account-head">
      <button type="button" className="icon-button" aria-label="Retour" onClick={close}>
        <ChevronLeft aria-hidden size={24} />
      </button>
      <div>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
    </header>
  )
}

export interface PasswordCheck { label: string; met: boolean }

/**
 * Mot de passe avec « Afficher » / « Masquer » ; conditions en liste, grises puis vertes avec une coche
 * dès qu'elles sont remplies, rouges avec une icône après un essai raté (C1, C5, C7 ; DECISIONS.md 21/11).
 */
export function PasswordField({ id, value, onChange, error, checks, showCheckErrors = false, autoComplete }: {
  id: string
  value: string
  onChange: (v: string) => void
  error?: string
  checks?: PasswordCheck[]
  showCheckErrors?: boolean
  autoComplete: 'new-password' | 'current-password'
}) {
  const [visible, setVisible] = useState(false)
  const describedBy = [checks ? `${id}-checks` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className="field">
      <label htmlFor={id}>Mot de passe</label>
      <div className="password-wrap">
        <input
          id={id}
          className="text-input"
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
        />
        <button type="button" className="text-link password-toggle" aria-controls={id} onClick={() => setVisible(!visible)}>
          {visible ? 'Masquer' : 'Afficher'}
        </button>
      </div>
      {checks && (
        <ul id={`${id}-checks`} className="password-checks" aria-label="Conditions du mot de passe" aria-live="polite">
          {checks.map((c) => {
            const failed = showCheckErrors && !c.met
            const Icon = c.met ? CircleCheck : failed ? CircleAlert : Circle
            return (
              <li key={c.label} className={c.met ? 'is-met' : failed ? 'is-error' : undefined}>
                <Icon aria-hidden size={18} />
                <span>{c.label}</span>
                <span className="sr-only">{c.met ? 'Condition remplie' : 'Condition non remplie'}</span>
              </li>
            )
          })}
        </ul>
      )}
      {error && <p id={`${id}-err`} className="field-error">{error}</p>}
    </div>
  )
}

/** Problème qui ne concerne pas un champ (réseau, échec général) ; « Réessayer » quand c'est utile. */
export function FormProblem({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="form-problem" role="alert">
      <p>{message}</p>
      {onRetry && <button type="button" className="text-link" onClick={onRetry}>Réessayer</button>}
    </div>
  )
}
