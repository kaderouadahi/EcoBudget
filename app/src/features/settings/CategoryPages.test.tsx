import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/defaults'

vi.mock('../../auth/AuthGate', () => ({ useUid: () => 'u1' }))
vi.mock('../../data/repo', () => ({ createDoc: vi.fn(), removeDoc: vi.fn(), updateDocFields: vi.fn() }))
vi.mock('../../data/DataProvider', () => ({
  useData: () => ({ categories: DEFAULT_CATEGORIES.map((c) => (c.id === 'repas' ? { ...c, icon: 'UtensilsCrossed' } : c)), ready: true }),
}))

import { ToastProvider } from '../../ui/Toast'
import { EditCategory } from './CategoryPages'

function at(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <Routes>
          <Route path="/reglages" element={<p>réglages</p>} />
          <Route path="/reglages/categories/:id" element={<EditCategory />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  )
}

describe('Modifier une catégorie', () => {
  it('« Autres » (URL tapée) : retour aux Réglages', () => {
    at('/reglages/categories/autres')
    expect(screen.getByText('réglages')).toBeInTheDocument()
  })
  it('catégorie inconnue : retour aux Réglages', () => {
    at('/reglages/categories/inconnue')
    expect(screen.getByText('réglages')).toBeInTheDocument()
  })
  it('ancienne icône de Repas : « Couverts » sélectionnée', () => {
    at('/reglages/categories/repas')
    expect(screen.getByRole('radio', { name: 'Couverts' })).toBeChecked()
  })
})
