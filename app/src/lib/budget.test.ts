import { describe, expect, it } from 'vitest'
import { budgetNotice, budgetState } from './budget'

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
