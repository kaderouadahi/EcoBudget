import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const applyBatch = vi.fn()
vi.mock('../../auth/AuthGate', () => ({ useUid: () => 'u1' }))
vi.mock('../../data/repo', () => ({ applyBatch: (...a: unknown[]) => applyBatch(...a) }))
vi.mock('../../data/DataProvider', () => ({
  useData: () => ({ categories: [], expenses: [], budgets: [], goals: [], contributions: [], ready: true }),
}))

import { ToastProvider } from '../../ui/Toast'
import { DemoPage } from './DemoPage'

function setup() {
  render(
    <MemoryRouter initialEntries={['/demo']}>
      <ToastProvider>
        <Routes>
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/" element={<p>accueil</p>} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  )
}

describe('page /demo', () => {
  beforeEach(() => applyBatch.mockClear())

  it('confirmation avec le message de la spec ; « Garder » n’écrit rien', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Données de démo' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Charger les données de démo' }))
    expect(screen.getByText('Toutes les données de ce compte seront remplacées par les données de démo.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Garder' }))
    expect(applyBatch).not.toHaveBeenCalled()
  })

  it('« Charger » : un seul envoi, retour à l’Accueil, message sans « Annuler »', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Charger les données de démo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Charger' }))
    expect(applyBatch).toHaveBeenCalledTimes(1)
    expect(applyBatch.mock.calls[0][0]).toBe('u1')
    expect(screen.getByText('accueil')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Données de démo chargées')
    expect(screen.queryByRole('button', { name: 'Annuler' })).not.toBeInTheDocument()
  })
})
