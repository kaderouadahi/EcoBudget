import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider, useToast, type ToastOptions } from './Toast'

let show: (t: ToastOptions) => void = () => {}
let dismiss: () => void = () => {}
function Grab() {
  const api = useToast()
  show = api.show
  dismiss = api.dismiss
  return null
}
const setup = () => render(<ToastProvider><Grab /></ToastProvider>)

describe('message de confirmation commun', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('affiche le message, sans « Annuler » si l’action n’est pas réversible', () => {
    setup()
    act(() => show({ message: 'Dépense ajoutée : 250 DA, Repas' }))
    expect(screen.getByRole('status')).toHaveTextContent('Dépense ajoutée : 250 DA, Repas')
    expect(screen.queryByRole('button', { name: 'Annuler' })).not.toBeInTheDocument()
  })

  it('« Annuler » appelle l’annulation une fois et ferme le message', () => {
    setup()
    const undo = vi.fn()
    act(() => show({ message: 'Dépense supprimée', undo }))
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(undo).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Dépense supprimée')).not.toBeInTheDocument()
  })

  it('disparaît après 6 s quand il propose « Annuler »', () => {
    setup()
    act(() => show({ message: 'Budget retiré', undo: () => {} }))
    act(() => { vi.advanceTimersByTime(5900) })
    expect(screen.getByText('Budget retiré')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.queryByText('Budget retiré')).not.toBeInTheDocument()
  })

  it('disparaît après 4 s sans « Annuler »', () => {
    setup()
    act(() => show({ message: 'Réglage enregistré' }))
    act(() => { vi.advanceTimersByTime(4100) })
    expect(screen.queryByText('Réglage enregistré')).not.toBeInTheDocument()
  })

  it('un état coloré a toujours une icône en plus de la couleur', () => {
    setup()
    act(() => show({ message: 'Courses : il reste 6 000 DA', tone: 'warn' }))
    expect(screen.getByTestId('toast-icon')).toBeInTheDocument()
  })

  it('dismiss ferme le message (à l’ouverture d’un formulaire, pour ne pas masquer son bouton)', () => {
    setup()
    act(() => show({ message: 'Dépense ajoutée : 250 DA, Repas', undo: () => {} }))
    act(() => dismiss())
    expect(screen.queryByText('Dépense ajoutée : 250 DA, Repas')).not.toBeInTheDocument()
  })

  it('un nouveau message remplace le précédent', () => {
    setup()
    act(() => show({ message: 'Premier' }))
    act(() => show({ message: 'Second' }))
    expect(screen.queryByText('Premier')).not.toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})
