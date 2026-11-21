import { Cloud, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import '../settings/settings.css'

/**
 * H14 : carte « Compte » de l'Accueil, tant que le compte est anonyme. Mêmes mots que Créer un compte,
 * mêmes boutons que Réglages › Compte (C6) ; le compte reste facultatif, rien à fermer (C2).
 */
export function AccountCard() {
  return (
    <section className="card account-card" aria-label="Compte">
      <div className="account-row">
        <span className="round-icon"><Cloud aria-hidden size={22} /></span>
        <p>Retrouvez vos dépenses sur tous vos appareils.</p>
      </div>
      <div className="account-actions">
        <Link to="/compte/creer" className="primary-button"><UserRound aria-hidden size={20} />Créer un compte</Link>
        <Link to="/compte/connexion" className="outline-button">Se connecter</Link>
      </div>
    </section>
  )
}
