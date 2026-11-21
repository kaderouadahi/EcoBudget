import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Après une validation ratée, focus sur le premier champ en erreur (comme le formulaire Dépense, C5).
 * Le focus est mis après le rendu : l'erreur est alors reliée au champ (aria-describedby) et lue avec lui.
 */
export function useFocusFirstError() {
  const formRef = useRef<HTMLFormElement>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (attempt) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [attempt])
  const focusFirstError = useCallback(() => setAttempt((n) => n + 1), [])
  return { formRef, focusFirstError }
}
