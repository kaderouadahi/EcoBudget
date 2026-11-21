import { Cloud, CloudCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOutSafely } from '../../auth/actions'
import { useAccount } from '../../auth/AuthGate'
import { SIGNED_OUT_MESSAGE, SIGNOUT_OFFLINE } from '../../lib/account'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { useToast } from '../../ui/Toast'

/**
 * Réglages › Compte (H9, DECISIONS.md 21/11) : état écrit en toutes lettres avec une icône (C7),
 * seules les actions possibles dans cet état (C2) ; déconnexion confirmée, jamais hors connexion (C3, C5).
 */
export function AccountSection() {
  const { email, isAnonymous } = useAccount()
  const { show } = useToast()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)

  if (isAnonymous) {
    return (
      <>
        <div className="account-row">
          <span className="round-icon"><Cloud aria-hidden size={22} /></span>
          <div>
            <strong>Sans compte pour l'instant</strong>
            <p className="muted">Vos données sont enregistrées de façon anonyme. Créez un compte pour les retrouver sur un autre appareil.</p>
          </div>
        </div>
        <div className="account-actions">
          <Link to="/compte/creer" className="primary-button"><UserRound aria-hidden size={20} />Créer un compte</Link>
          <Link to="/compte/connexion" className="outline-button">Se connecter</Link>
        </div>
      </>
    )
  }

  async function signOutNow() {
    setConfirming(false)
    setPending(true)
    // Toute erreur est traitée comme hors connexion : le bouton ne reste jamais bloqué sur « Déconnexion… ».
    const result = await signOutSafely().catch(() => 'offline' as const)
    if (result === 'ok') {
      navigate('/', { replace: true })
      show({ message: SIGNED_OUT_MESSAGE })
      return
    }
    setPending(false)
    show({ message: SIGNOUT_OFFLINE })
  }

  return (
    <>
      <div className="account-row">
        <span className="round-icon"><CloudCheck aria-hidden size={22} /></span>
        <div>
          <strong>Connecté</strong>
          <p className="account-email">{email}</p>
          <p className="muted">Vos données sont enregistrées dans votre compte : vous les retrouvez sur tous vos appareils.</p>
        </div>
      </div>
      <button
        type="button"
        className="outline-button"
        disabled={pending}
        onClick={() => (navigator.onLine ? setConfirming(true) : show({ message: SIGNOUT_OFFLINE }))}
      >
        {pending ? 'Déconnexion…' : 'Se déconnecter'}
      </button>
      {confirming && (
        <ConfirmDialog
          title="Se déconnecter ?"
          message="Vos données restent dans votre compte : vous les retrouverez en vous reconnectant. Cet appareil repartira sans données."
          cancelLabel="Rester connecté"
          confirmLabel="Se déconnecter"
          tone="primary"
          onCancel={() => setConfirming(false)}
          onConfirm={signOutNow}
        />
      )}
    </>
  )
}
