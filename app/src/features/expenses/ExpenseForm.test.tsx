import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/defaults'
import { ExpenseForm, type ExpenseValues } from './ExpenseForm'

const TODAY = new Date(2026, 10, 19)
const categories = DEFAULT_CATEGORIES

function setup(p: Partial<Parameters<typeof ExpenseForm>[0]> = {}) {
  const onSubmit = vi.fn<(v: ExpenseValues) => void>()
  render(
    <ExpenseForm
      categories={categories}
      proposedId="repas"
      today={TODAY}
      submitLabel="Enregistrer la dépense"
      onSubmit={onSubmit}
      onClose={() => {}}
      {...p}
    />,
  )
  return { onSubmit }
}

const amount = () => screen.getByLabelText('Montant')
const submit = () => fireEvent.click(screen.getByRole('button', { name: /Enregistrer la dépense/ }))

describe('ExpenseForm', () => {
  it('propose la catégorie et la date du jour', () => {
    setup()
    expect(screen.getByText('Proposée : Repas')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Repas' })).toBeChecked()
    expect(screen.getByLabelText('Date')).toHaveValue('2026-11-19')
    expect(screen.getByText('En dinars, sans centimes. Exemple : 250')).toBeInTheDocument()
  })

  it('montant vide : erreur au champ Montant, rien n’est enregistré', () => {
    const { onSubmit } = setup()
    submit()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(amount()).toHaveAttribute('aria-invalid', 'true')
    expect(amount()).toHaveAccessibleDescription(/Saisissez un montant en dinars, par exemple 250/)
  })

  it('montant décimal refusé', () => {
    const { onSubmit } = setup()
    fireEvent.change(amount(), { target: { value: '2,5' } })
    submit()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Sans centimes : saisissez un nombre entier, par exemple 250')).toBeInTheDocument()
  })

  it('date future refusée', () => {
    const { onSubmit } = setup()
    fireEvent.change(amount(), { target: { value: '250' } })
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-11-25' } })
    submit()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('La date ne peut pas être dans le futur')).toBeInTheDocument()
  })

  it('valeurs valides : enregistrées une seule fois même avec un double clic', () => {
    const { onSubmit } = setup()
    fireEvent.change(amount(), { target: { value: '2 500' } })
    fireEvent.click(screen.getByRole('radio', { name: 'Courses' }))
    fireEvent.change(screen.getByLabelText('Note (facultatif)'), { target: { value: ' Supérette ' } })
    submit()
    submit()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({ amount: 2500, categoryId: 'courses', date: '2026-11-19', note: 'Supérette' })
  })

  it('note vide : envoyée comme absente', () => {
    const { onSubmit } = setup()
    fireEvent.change(amount(), { target: { value: '250' } })
    submit()
    expect(onSubmit).toHaveBeenCalledWith({ amount: 250, categoryId: 'repas', date: '2026-11-19', note: undefined })
  })

  it('modification : prérempli, bouton Supprimer la dépense', () => {
    const onDelete = vi.fn()
    setup({
      initial: { amount: 2500, categoryId: 'sorties', date: '2026-11-14', note: 'Cinéma' },
      submitLabel: 'Enregistrer',
      onDelete,
    })
    expect(amount()).toHaveValue('2500')
    expect(screen.getByRole('radio', { name: 'Sorties' })).toBeChecked()
    expect(screen.queryByText(/Proposée/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer la dépense' }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('« Gérer les catégories » : fenêtre seulement s’il y a une saisie non enregistrée (H11)', () => {
    const onManageCategories = vi.fn()
    setup({ onManageCategories })
    const link = () => screen.getByRole('link', { name: 'Gérer les catégories' })
    fireEvent.click(link())
    expect(onManageCategories).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    fireEvent.change(amount(), { target: { value: '250' } })
    fireEvent.click(link())
    expect(screen.getByRole('alertdialog', { name: 'Quitter sans enregistrer la dépense ?' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Rester' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(amount()).toHaveValue('250')
    expect(onManageCategories).toHaveBeenCalledTimes(1)
    fireEvent.click(link())
    fireEvent.click(screen.getByRole('button', { name: 'Quitter' }))
    expect(onManageCategories).toHaveBeenCalledTimes(2)
  })
})

