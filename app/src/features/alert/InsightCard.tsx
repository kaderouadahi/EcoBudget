import { Bell, Check, CircleHelp, Lightbulb, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import './alert.css'

interface Props {
  icon: 'bell' | 'bulb'
  title: string
  /** Texte de la carte. */
  subtitle: string
  /** Ligne sous le titre dans le panneau (par défaut : le texte de la carte). */
  panelSubtitle?: string
  /** Phrase « Pourquoi ? ». */
  why: string
  /** « Gérer les alertes » / « Gérer les conseils » → Réglages. */
  manageLabel: string
  onDismiss: () => void
}

/**
 * Carte de l'innovation (alerte H3, conseil H5) : même composant, même fonctionnement (C6).
 * Informe seulement (C3) ; bleu vif, jamais les couleurs des budgets (C7) ; « Pourquoi ? » explique (C1).
 */
export function InsightCard({ icon, title, subtitle, panelSubtitle, why, manageLabel, onDismiss }: Props) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const Icon = icon === 'bell' ? Bell : Lightbulb
  return (
    <>
      <section className="alert-card" aria-labelledby={titleId}>
        <div className="alert-card-top">
          <span className="alert-bell"><Icon aria-hidden size={22} /></span>
          <div>
            <h2 id={titleId} className="alert-title">{title}</h2>
            <p className="alert-sub">{subtitle}</p>
          </div>
        </div>
        <div className="alert-actions">
          <button type="button" className="alert-why" onClick={() => setOpen(true)}>
            <CircleHelp aria-hidden size={20} />
            Pourquoi ?
          </button>
          <button type="button" className="alert-ok" onClick={onDismiss}>Compris</button>
        </div>
      </section>
      {open && (
        <InsightPanel
          Icon={Icon}
          title={title}
          subtitle={panelSubtitle ?? subtitle}
          why={why}
          manageLabel={manageLabel}
          onClose={() => setOpen(false)}
          onDismiss={() => {
            setOpen(false)
            onDismiss()
          }}
        />
      )}
    </>
  )
}

function InsightPanel({ Icon, title, subtitle, why, manageLabel, onClose, onDismiss }: {
  Icon: typeof Bell
  title: string
  subtitle: string
  why: string
  manageLabel: string
  onClose: () => void
  onDismiss: () => void
}) {
  const titleId = useId()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="alert-backdrop" onClick={onClose}>
      <div className="alert-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <span className="alert-handle" aria-hidden />
        <div className="alert-panel-head">
          <span className="alert-bell"><Icon aria-hidden size={24} /></span>
          <div className="alert-panel-titles">
            <h2 id={titleId}>{title}</h2>
            <p className="alert-sub">{subtitle}</p>
          </div>
          <button type="button" className="icon-button" aria-label="Fermer" onClick={onClose} autoFocus>
            <X aria-hidden size={22} />
          </button>
        </div>
        <div className="alert-why-box">
          <h3>Pourquoi ?</h3>
          <p>{why}</p>
        </div>
        <div className="alert-panel-actions">
          <Link to="/reglages" className="alert-manage">{manageLabel}</Link>
          <button type="button" className="primary-button" onClick={onDismiss}>
            <Check aria-hidden size={22} />
            Compris
          </button>
        </div>
      </div>
    </div>
  )
}
