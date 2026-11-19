import { useEffect, useRef } from 'react'
import './ConfirmDialog.css'

interface Props {
  title: string
  message?: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/** Confirmation d'une action destructive (CLAUDE.md §8, C3/C5) ; toujours suivie d'un « Annuler ». */
export function ConfirmDialog({ title, message, confirmLabel, cancelLabel = 'Garder', onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title">{title}</h2>
        {message && <p>{message}</p>}
        <div className="dialog-actions">
          <button type="button" ref={cancelRef} className="dialog-cancel" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className="dialog-confirm" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
