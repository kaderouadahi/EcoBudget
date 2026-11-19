import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/defaults'
import { BudgetForm } from './BudgetForm'

const choices = DEFAULT_CATEGORIES.filter((c) => c.id !== 'repas')

describe('BudgetForm', () => {
  it('création : catégorie à choisir, aide sur la reconduction', () => {
    render(<BudgetForm choices={choices} initialCategoryId="courses" onSubmit={() => {}} onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Fixer un budget' })).toBeInTheDocument()
    expect(screen.getByLabelText('Catégorie')).toHaveValue('courses')
    expect(screen.getByText('Budget reconduit chaque mois. Vous pouvez le changer à tout moment.')).toBeInTheDocument()
  })

  it('montant invalide : bloqué, erreur au champ', () => {
    const onSubmit = vi.fn()
    render(<BudgetForm choices={choices} initialCategoryId="courses" onSubmit={onSubmit} onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText('Montant mensuel'), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer le budget/ }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Montant mensuel')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Le montant doit être supérieur à 0, par exemple 250')).toBeInTheDocument()
  })

  it('valeurs valides envoyées une fois', () => {
    const onSubmit = vi.fn()
    render(<BudgetForm choices={choices} initialCategoryId="courses" onSubmit={onSubmit} onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: 'sorties' } })
    fireEvent.change(screen.getByLabelText('Montant mensuel'), { target: { value: '5 000' } })
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer le budget/ }))
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer le budget/ }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({ categoryId: 'sorties', amount: 5000 })
  })

  it('modification : catégorie fixe, montant prérempli, « Retirer le budget »', () => {
    const onRemove = vi.fn()
    render(
      <BudgetForm
        choices={[]}
        fixedCategory={DEFAULT_CATEGORIES[1]}
        initialAmount={40000}
        onSubmit={() => {}}
        onRemove={onRemove}
        onClose={() => {}}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Modifier le budget Courses' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Catégorie')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Montant mensuel')).toHaveValue('40000')
    fireEvent.click(screen.getByRole('button', { name: 'Retirer le budget' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})
