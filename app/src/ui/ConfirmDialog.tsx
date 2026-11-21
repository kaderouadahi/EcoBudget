import { useEffect, useId, useRef, type ReactNode } from 'react'
import './ConfirmDialog.css'

interface Props {
  title: string
  message?: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  /** Contenu en plus sous le message (ex. menu « Déplacer les dépenses vers »). */
  children?: ReactNode
  /** 'primary' quand rien n'est perdu (bouton bleu au lieu de rouge). */
  tone?: 'danger' | 'primary'
}

/** Confirmation d'une action destructive (CLAUDE.md §8, C3/C5) ; toujours suivie d'un « Annuler ». */
export function ConfirmDialog({ title, message, confirmLabel, cancelLabel = 'Garder', onConfirm, onCancel, children, tone = 'danger' }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const descId = useId()
  // Focus sur « Garder » à l'ouverture seulement : un nouveau rendu (menu modifié) ne doit pas voler le focus.
  const cancel = useRef(onCancel)
  cancel.current = onCancel
  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel.current() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={descId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title">{title}</h2>
        <div id={descId}>
          {message && <p>{message}</p>}
          {children}
        </div>
        <div className="dialog-actions">
          <button type="button" ref={cancelRef} className="dialog-cancel" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className={tone === 'primary' ? 'dialog-confirm is-primary' : 'dialog-confirm'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
