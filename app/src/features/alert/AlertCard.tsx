import { Bell, Check, CircleHelp, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import type { UnusualAlert } from '../../data/model'
import { formatDA, formatDay } from '../../lib/format'
import './alert.css'

interface Props {
  alert: UnusualAlert
  categoryName: string
  today: Date
  onDismiss: () => void
}

/**
 * Carte « Dépense inhabituelle » (H3, innovation) : informe seulement (C3), en bleu vif et non
 * en orange, réservé aux budgets (C7) ; « Pourquoi ? » explique en une phrase (C1), « Compris » ferme.
 */
export function AlertCard({ alert, categoryName, today, onDismiss }: Props) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const title = `Dépense inhabituelle en ${categoryName}`
  const when = `${formatDA(alert.amount)} · ${formatDay(alert.date, today)}`
  return (
    <>
      <section className="alert-card" aria-labelledby={titleId}>
        <div className="alert-card-top">
          <span className="alert-bell"><Bell aria-hidden size={22} /></span>
          <div>
            <h2 id={titleId} className="alert-title">{title}</h2>
            <p className="alert-sub">{when}, nettement plus que d'habitude.</p>
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
        <AlertPanel
          title={title}
          when={when}
          why={alert.why}
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

function AlertPanel({ title, when, why, onClose, onDismiss }: {
  title: string
  when: string
  why: string
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
          <span className="alert-bell"><Bell aria-hidden size={24} /></span>
          <div className="alert-panel-titles">
            <h2 id={titleId}>{title}</h2>
            <p className="alert-sub">{when}</p>
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
          <Link to="/reglages" className="alert-manage">Gérer les alertes</Link>
          <button type="button" className="primary-button" onClick={onDismiss}>
            <Check aria-hidden size={22} />
            Compris
          </button>
        </div>
      </div>
    </div>
  )
}
