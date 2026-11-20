import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/defaults'
import type { Category } from '../../data/model'
import { CategoryForm } from './CategoryForm'

const CATS = DEFAULT_CATEGORIES as Category[]

describe('CategoryForm', () => {
  it('création : titre, icône Bébé présélectionnée, noms accessibles, « … » absente', () => {
    render(<CategoryForm categories={CATS} onSubmit={() => {}} onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Nouvelle catégorie' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Bébé' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Cadeau' })).not.toBeChecked()
    expect(screen.queryByRole('radio', { name: /Autres|Points/ })).not.toBeInTheDocument()
  })

  it('erreurs au champ Nom : vide puis doublon', () => {
    const onSubmit = vi.fn()
    render(<CategoryForm categories={CATS} onSubmit={onSubmit} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Ajouter la catégorie/ }))
    expect(screen.getByText('Donnez un nom à la catégorie, par exemple Enfants')).toBeInTheDocument()
    expect(screen.getByLabelText('Nom')).toHaveAttribute('aria-invalid', 'true')
    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: ' sorties ' } })
    fireEvent.click(screen.getByRole('button', { name: /Ajouter la catégorie/ }))
    expect(screen.getByText('Cette catégorie existe déjà')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('valeurs valides envoyées une fois, nom sans espaces autour', () => {
    const onSubmit = vi.fn()
    render(<CategoryForm categories={CATS} onSubmit={onSubmit} onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: '  Enfants ' } })
    fireEvent.click(screen.getByRole('button', { name: /Ajouter la catégorie/ }))
    fireEvent.click(screen.getByRole('button', { name: /Ajouter la catégorie/ }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Enfants', icon: 'Baby' })
  })

  it('modification : prérempli, icône actuelle, son propre nom accepté', () => {
    const onSubmit = vi.fn()
    render(<CategoryForm categories={CATS} initial={CATS[3]} onSubmit={onSubmit} onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Modifier la catégorie' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nom')).toHaveValue('Sorties')
    expect(screen.getByRole('radio', { name: 'Ticket' })).toBeChecked()
    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Loisirs' } })
    fireEvent.click(screen.getByRole('radio', { name: 'Avion' }))
    fireEvent.click(screen.getByRole('button', { name: /^Enregistrer$/ }))
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Loisirs', icon: 'Plane' })
  })
})
