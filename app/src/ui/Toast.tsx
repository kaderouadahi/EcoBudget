import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import './Toast.css'

export type ToastTone = 'neutral' | 'ok' | 'warn' | 'danger'

export interface ToastOptions {
  message: string
  /** État coloré : toujours accompagné d'une icône (jamais la couleur seule, C7). */
  tone?: ToastTone
  /** Présent quand l'action est réversible : affiche « Annuler » (C3). */
  undo?: () => void
}

interface ToastApi {
  show: (t: ToastOptions) => void
  /** Ferme le message en cours (ex. à l'ouverture d'un formulaire, pour ne pas masquer son bouton). */
  dismiss: () => void
}

const ToastContext = createContext<ToastApi | null>(null)

const ICONS = { ok: CircleCheck, warn: TriangleAlert, danger: CircleAlert } as const

export const TOAST_MS_WITH_UNDO = 6000
export const TOAST_MS = 4000

/** Message de confirmation commun (HANDOFF H0) : retour visible après chaque action (C1). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { key: number }) | null>(null)

  const show = useCallback((t: ToastOptions) => setToast({ ...t, key: Date.now() + Math.random() }), [])
  const dismiss = useCallback(() => setToast(null), [])
  const api = useMemo(() => ({ show, dismiss }), [show, dismiss])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), toast.undo ? TOAST_MS_WITH_UNDO : TOAST_MS)
    return () => clearTimeout(id)
  }, [toast])

  const tone = toast?.tone ?? 'neutral'
  const Icon = tone === 'neutral' ? null : ICONS[tone]

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div key={toast.key} className={`toast toast-${tone}`}>
            {Icon && <Icon data-testid="toast-icon" aria-hidden size={20} className="toast-icon" />}
            <span className="toast-message">{toast.message}</span>
            {toast.undo && (
              <button
                type="button"
                className="toast-undo"
                onClick={() => {
                  toast.undo?.()
                  setToast(null)
                }}
              >
                Annuler
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast doit être utilisé sous <ToastProvider>')
  return api
}
