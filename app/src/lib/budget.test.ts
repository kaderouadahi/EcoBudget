import { describe, expect, it } from 'vitest'
import type { Budget, Category, Expense } from '../data/model'
import { barRatio, budgetNotice, budgetState, budgetSummary, headline, percent } from './budget'

describe('budgetState', () => {
  it('79 % : dans le budget', () => {
    expect(budgetState(7900, 10000)).toEqual({ kind: 'ok', remaining: 2100 })
  })
  it('80 % pile : orange', () => {
    expect(budgetState(8000, 10000)).toEqual({ kind: 'warn', remaining: 2000 })
  })
  it('100 % : orange, il reste 0', () => {
    expect(budgetState(10000, 10000)).toEqual({ kind: 'warn', remaining: 0 })
  })
  it('101 % : dépassé', () => {
    expect(budgetState(10100, 10000)).toEqual({ kind: 'over', remaining: -100 })
  })
  it('aucune dépense', () => {
    expect(budgetState(0, 5000)).toEqual({ kind: 'ok', remaining: 5000 })
  })
})

describe('budgetNotice (message de confirmation)', () => {
  it('rien sous 80 %', () => {
    expect(budgetNotice('Repas', 3250, 8000)).toBeNull()
  })
  it('il reste X DA entre 80 et 100 %', () => {
    expect(budgetNotice('Courses', 34000, 40000)).toEqual({ text: 'Courses : il reste 6 000 DA', tone: 'warn' })
  })
  it('dépassé de X DA au-delà', () => {
    expect(budgetNotice('Sorties', 5900, 5000)).toEqual({ text: 'Sorties : dépassé de 900 DA', tone: 'danger' })
  })
})

const C = (id: string, name: string, order: number): Category => ({ id, name, icon: 'Ellipsis', order, locked: false })
const CATS = [C('repas', 'Repas', 0), C('courses', 'Courses', 1), C('sorties', 'Sorties', 3), C('sante', 'Santé', 4)]
const E = (amount: number, categoryId: string, date = '2026-11-10'): Expense => ({ id: `${categoryId}-${amount}-${date}`, amount, categoryId, date, createdAt: 0 })
const B = (id: string, amount: number): Budget => ({ id, amount })

describe('budgetSummary', () => {
  const expenses = [
    E(34000, 'courses'), E(3250, 'repas'), E(5900, 'sorties'), E(1800, 'sante'),
    E(9999, 'courses', '2026-10-31'), // autre mois : exclu
  ]

  it('reste à dépenser = budgets fixés − dépenses de ces catégories ; hors budget à part', () => {
    const s = budgetSummary([B('courses', 40000), B('repas', 8000), B('sorties', 5000)], CATS, expenses, '2026-11')
    expect(s.totalBudget).toBe(53000)
    expect(s.spentInBudgets).toBe(43150)
    expect(s.remaining).toBe(9850)
    expect(s.spentTotal).toBe(44950)
    expect(s.offBudget).toEqual([{ categoryId: 'sante', spent: 1800 }])
    expect(s.rows.map((r) => [r.categoryId, r.kind, r.percent])).toEqual([
      ['repas', 'ok', 41], ['courses', 'warn', 85], ['sorties', 'over', 118],
    ])
  })

  it('sans catégorie hors budget', () => {
    const s = budgetSummary([B('courses', 40000), B('repas', 8000), B('sorties', 5000), B('sante', 2000)], CATS, expenses, '2026-11')
    expect(s.offBudget).toEqual([])
    expect(s.remaining).toBe(55000 - 44950)
  })

  it('reste négatif', () => {
    const s = budgetSummary([B('sorties', 5000)], CATS, expenses, '2026-11')
    expect(s.remaining).toBe(-900)
    expect(headline(s, 'novembre')).toEqual({ label: 'Budgets dépassés de', value: 900, tone: 'danger' })
  })

  it('aucun budget : dépensé ce mois', () => {
    const s = budgetSummary([], CATS, expenses, '2026-11')
    expect(s.rows).toEqual([])
    expect(s.offBudget.map((o) => o.categoryId)).toEqual(['courses', 'sorties', 'repas', 'sante'])
    expect(headline(s, 'novembre')).toEqual({ label: 'Dépensé ce mois', value: 44950, tone: 'neutral' })
  })

  it('reste exactement 0 : pas « dépassé »', () => {
    const s = budgetSummary([B('sorties', 5900)], CATS, expenses, '2026-11')
    expect(headline(s, 'novembre')).toEqual({ label: 'Reste à dépenser en novembre', value: 0, tone: 'neutral' })
  })

  it('budget d’une catégorie disparue : ignoré', () => {
    const s = budgetSummary([B('fantome', 1000), B('repas', 8000)], CATS, expenses, '2026-11')
    expect(s.rows.map((r) => r.categoryId)).toEqual(['repas'])
    expect(s.totalBudget).toBe(8000)
  })
})

describe('percent et barRatio', () => {
  it('pourcentage arrondi', () => {
    expect(percent(34000, 40000)).toBe(85)
    expect(percent(1, 3)).toBe(33)
  })
  it('barre bornée entre 0 et 1', () => {
    expect(barRatio(5900, 5000)).toBe(1)
    expect(barRatio(0, 5000)).toBe(0)
    expect(barRatio(2500, 5000)).toBe(0.5)
  })
})
