import { describe, expect, it } from 'vitest'
import type { Contribution, Goal } from '../data/model'
import {
  correction, goalPercent, goalStatus, milestone, monthLabel, nextMonth, parseSaved,
  progressNotice, savedAmount, sortGoals, validateTargetMonth,
} from './goals'

const C = (goalId: string, amount: number): Contribution => ({ id: `${goalId}${amount}`, goalId, amount, date: '2026-11-10', createdAt: 0 })
const G = (id: string, targetMonth: string, createdAt = 0): Goal => ({ id, name: id, target: 1000, targetMonth, createdAt })
const TODAY = new Date(2026, 10, 19)

describe('savedAmount', () => {
  it('somme des versements de l’objectif, corrections négatives comprises', () => {
    expect(savedAmount('a', [C('a', 60000), C('a', 30000), C('b', 5000), C('a', -10000)])).toBe(80000)
  })
  it('aucun versement : 0', () => { expect(savedAmount('a', [])).toBe(0) })
})

describe('goalPercent', () => {
  it('arrondi vers le bas, jamais 100 % tant que non atteint', () => {
    expect(goalPercent(0, 150000)).toBe(0)
    expect(goalPercent(89850, 150000)).toBe(59)
    expect(goalPercent(149999, 150000)).toBe(99)
  })
  it('100 % quand atteint, plafonné au-delà', () => {
    expect(goalPercent(150000, 150000)).toBe(100)
    expect(goalPercent(180000, 150000)).toBe(100)
  })
})

describe('milestone', () => {
  it.each([[24, null], [25, 25], [49, 25], [50, 50], [75, 75], [99, 75], [100, null]])('%i %% → %s', (p, m) => {
    expect(milestone(p as number)).toBe(m)
  })
})

describe('goalStatus', () => {
  it('en cours, atteint, date passée', () => {
    expect(goalStatus(90000, 150000, '2027-06', '2026-11')).toBe('ongoing')
    expect(goalStatus(150000, 150000, '2027-06', '2026-11')).toBe('reached')
    expect(goalStatus(90000, 150000, '2026-10', '2026-11')).toBe('late')
  })
  it('mois visé = mois en cours : pas encore passé', () => {
    expect(goalStatus(0, 150000, '2026-11', '2026-11')).toBe('ongoing')
  })
  it('atteint prime sur date passée', () => {
    expect(goalStatus(150000, 150000, '2026-01', '2026-11')).toBe('reached')
  })
  it('atteint ↔ en cours après correction ou changement du visé', () => {
    expect(goalStatus(150000 - 1, 150000, '2027-06', '2026-11')).toBe('ongoing')
    expect(goalStatus(90000, 80000, '2027-06', '2026-11')).toBe('reached')
    expect(goalStatus(90000, 100000, '2027-06', '2026-11')).toBe('ongoing')
  })
})

describe('sortGoals', () => {
  it('en cours par mois visé puis création ; atteints en bas, même ordre', () => {
    const items = [
      { goal: G('reachedLate', '2028-01'), status: 'reached' as const },
      { goal: G('far', '2027-12'), status: 'ongoing' as const },
      { goal: G('nearB', '2027-06', 2), status: 'ongoing' as const },
      { goal: G('late', '2026-09'), status: 'late' as const },
      { goal: G('nearA', '2027-06', 1), status: 'ongoing' as const },
      { goal: G('reachedSoon', '2027-01'), status: 'reached' as const },
    ]
    expect(sortGoals(items).map((i) => i.goal.id)).toEqual(['late', 'nearA', 'nearB', 'far', 'reachedSoon', 'reachedLate'])
  })
})

describe('parseSaved et correction', () => {
  it('0 accepté, entier positif accepté', () => {
    expect(parseSaved('0')).toEqual({ ok: true, value: 0 })
    expect(parseSaved('90 000')).toEqual({ ok: true, value: 90000 })
  })
  it('négatif refusé', () => {
    expect(parseSaved('-1')).toEqual({ ok: false, error: 'Le montant épargné ne peut pas être négatif, par exemple 0' })
  })
  it('vide et décimal : messages d’un montant de dépense', () => {
    expect(parseSaved('')).toEqual({ ok: false, error: 'Saisissez un montant en dinars, par exemple 250' })
    expect(parseSaved('2,5')).toEqual({ ok: false, error: 'Sans centimes : saisissez un nombre entier, par exemple 250' })
  })
  it('correction à la hausse, à la baisse, jusqu’à 0', () => {
    expect(correction(90000, 100000)).toBe(10000)
    expect(correction(90000, 80000)).toBe(-10000)
    expect(correction(90000, 0)).toBe(-90000)
    expect(correction(90000, 90000)).toBe(0)
  })
})

describe('date visée', () => {
  it('mois prochain et libellé', () => {
    expect(nextMonth(TODAY)).toBe('2026-12')
    expect(nextMonth(new Date(2026, 11, 31))).toBe('2027-01')
    expect(monthLabel('2027-06')).toBe('juin 2027')
  })
  it('vide refusé', () => {
    expect(validateTargetMonth('', TODAY)).toBe('Choisissez une date visée')
  })
  it('mois en cours refusé, mois prochain accepté', () => {
    expect(validateTargetMonth('2026-11', TODAY)).toBe('Choisissez un mois à partir de décembre 2026')
    expect(validateTargetMonth('2026-12', TODAY)).toBeNull()
  })
  it('modification : date passée inchangée acceptée, changée vers le passé refusée', () => {
    expect(validateTargetMonth('2026-09', TODAY, '2026-09')).toBeNull()
    expect(validateTargetMonth('2026-10', TODAY, '2026-09')).toBe('Choisissez un mois à partir de décembre 2026')
  })
})

describe('progressNotice', () => {
  it('étape franchie', () => { expect(progressNotice(60000, 90000, 150000)).toBe('Étape franchie : 50 % !') })
  it('pas de nouvelle étape', () => { expect(progressNotice(90000, 105000, 150000)).toBeNull() })
  it('objectif atteint', () => { expect(progressNotice(135000, 150000, 150000)).toBe('Objectif atteint !') })
  it('déjà atteint : rien de nouveau', () => { expect(progressNotice(150000, 160000, 150000)).toBeNull() })
  it('premier versement qui saute deux étapes : la plus haute', () => {
    expect(progressNotice(0, 120000, 150000)).toBe('Étape franchie : 75 % !')
  })
})
