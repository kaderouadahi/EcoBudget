import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GoalForm } from './GoalForm'
import { SavingsForm } from './SavingsForm'

const TODAY = new Date(2026, 10, 19)
const norm = (s: string | null) => (s ?? '').replace(/\s/g, ' ')

function fillNew(name: string, amount: string, month: string, year: string) {
  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: name } })
  fireEvent.change(screen.getByLabelText('Montant à atteindre'), { target: { value: amount } })
  if (month) fireEvent.change(screen.getByLabelText('Mois visé'), { target: { value: month } })
  if (year) fireEvent.change(screen.getByLabelText('Année visée'), { target: { value: year } })
}
const create = () => fireEvent.click(screen.getByRole('button', { name: /Créer l'objectif/ }))

describe('GoalForm (création)', () => {
  const setup = () => {
    const onSubmit = vi.fn()
    render(<GoalForm today={TODAY} onSubmit={onSubmit} onClose={() => {}} />)
    return onSubmit
  }

  it('trois champs, pas de date par défaut, aide « Au plus tôt », années jusqu’à +10', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Nouvel objectif' })).toBeInTheDocument()
    expect(screen.getByLabelText('Mois visé')).toHaveValue('')
    expect(screen.getByLabelText('Année visée')).toHaveValue('')
    expect(screen.getByText('Au plus tôt décembre 2026')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '2036' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Montant épargné')).not.toBeInTheDocument()
  })

  it('nom vide : erreur au champ', () => {
    const onSubmit = setup()
    fillNew('  ', '150000', '06', '2027')
    create()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Donnez un nom à votre objectif, par exemple Ordinateur portable')).toBeInTheDocument()
    expect(screen.getByLabelText('Nom')).toHaveAttribute('aria-invalid', 'true')
  })

  it('montant 0 : message d’un montant de dépense', () => {
    const onSubmit = setup()
    fillNew('Vacances', '0', '06', '2027')
    create()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Le montant doit être supérieur à 0, par exemple 250')).toBeInTheDocument()
  })

  it('mois sans année : erreur au champ Date visée', () => {
    const onSubmit = setup()
    fillNew('Vacances', '40000', '07', '')
    create()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Choisissez une date visée')).toBeInTheDocument()
  })

  it('mois en cours refusé', () => {
    const onSubmit = setup()
    fillNew('Vacances', '40000', '11', '2026')
    create()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Choisissez un mois à partir de décembre 2026')).toBeInTheDocument()
  })

  it('valeurs valides envoyées une seule fois', () => {
    const onSubmit = setup()
    fillNew(' Ordinateur portable ', '150 000', '06', '2027')
    create()
    create()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ordinateur portable', target: 150000, targetMonth: '2027-06' })
  })
})

describe('GoalForm (modification)', () => {
  const initial = { name: 'Ordinateur portable', target: 150000, targetMonth: '2026-09' }
  const setup = () => {
    const onSubmit = vi.fn()
    const onDelete = vi.fn()
    render(<GoalForm today={TODAY} initial={initial} initialSaved={90000} onSubmit={onSubmit} onDelete={onDelete} onClose={() => {}} />)
    return { onSubmit, onDelete }
  }
  const save = () => fireEvent.click(screen.getByRole('button', { name: /^Enregistrer$/ }))

  it('prérempli, date passée inchangée acceptée, montant épargné envoyé', () => {
    const { onSubmit } = setup()
    expect(screen.getByRole('heading', { name: "Modifier l'objectif" })).toBeInTheDocument()
    expect(screen.getByLabelText('Nom')).toHaveValue('Ordinateur portable')
    expect(screen.getByLabelText('Montant épargné')).toHaveValue('90000')
    expect(screen.getByLabelText('Année visée')).toHaveValue('2026')
    fireEvent.change(screen.getByLabelText('Montant épargné'), { target: { value: '100000' } })
    save()
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ordinateur portable', target: 150000, targetMonth: '2026-09', saved: 100000 })
  })

  it('montant épargné négatif refusé', () => {
    const { onSubmit } = setup()
    fireEvent.change(screen.getByLabelText('Montant épargné'), { target: { value: '-5' } })
    save()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Le montant épargné ne peut pas être négatif, par exemple 0')).toBeInTheDocument()
  })

  it('date changée vers un mois passé : refusée', () => {
    const { onSubmit } = setup()
    fireEvent.change(screen.getByLabelText('Mois visé'), { target: { value: '10' } })
    save()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('« Supprimer l’objectif »', () => {
    const { onDelete } = setup()
    fireEvent.click(screen.getByRole('button', { name: "Supprimer l'objectif" }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})

describe('SavingsForm', () => {
  const setup = () => {
    const onSubmit = vi.fn()
    render(<SavingsForm goalName="Ordinateur portable" remaining={60000} today={TODAY} onSubmit={onSubmit} onClose={() => {}} />)
    return onSubmit
  }
  const add = () => fireEvent.click(screen.getByRole('button', { name: /Ajouter l'épargne/ }))

  it('aide « Il reste X DA », date du jour par défaut', () => {
    const { container } = render(<div />)
    setup()
    expect(norm(document.body.textContent)).toContain('Il reste 60 000 DA pour atteindre l\'objectif')
    expect(screen.getByLabelText('Date')).toHaveValue('2026-11-19')
    void container
  })

  it('date future refusée', () => {
    const onSubmit = setup()
    fireEvent.change(screen.getByLabelText('Montant'), { target: { value: '5000' } })
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-11-25' } })
    add()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('La date ne peut pas être dans le futur')).toBeInTheDocument()
  })

  it('montant supérieur au reste accepté, envoyé une fois', () => {
    const onSubmit = setup()
    fireEvent.change(screen.getByLabelText('Montant'), { target: { value: '90000' } })
    add()
    add()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({ amount: 90000, date: '2026-11-19' })
  })
})
