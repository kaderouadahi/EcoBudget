import { describe, expect, it } from 'vitest'
import { addMonths, currentMonth, daysLeftInMonth, isInMonth, monthOf, toISODate } from './month'

describe('toISODate', () => {
  it('date locale sur deux chiffres', () => {
    expect(toISODate(new Date(2026, 0, 31))).toBe('2026-01-31')
    expect(toISODate(new Date(2026, 10, 5, 23, 59))).toBe('2026-11-05')
  })
})

describe('monthOf / currentMonth', () => {
  it('mois d’une date ISO', () => {
    expect(monthOf('2026-11-19')).toBe('2026-11')
  })
  it('mois courant', () => {
    expect(currentMonth(new Date(2026, 11, 31))).toBe('2026-12')
  })
})

describe('addMonths', () => {
  it('passage d’année vers l’avant', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01')
  })
  it('passage d’année vers l’arrière', () => {
    expect(addMonths('2026-01', -1)).toBe('2025-12')
  })
  it('mois suivant simple', () => {
    expect(addMonths('2026-01', 1)).toBe('2026-02')
  })
  it('plusieurs mois', () => {
    expect(addMonths('2026-11', -4)).toBe('2026-07')
    expect(addMonths('2026-11', 14)).toBe('2028-01')
  })
})

describe('daysLeftInMonth', () => {
  it('jour courant inclus', () => {
    expect(daysLeftInMonth(new Date(2026, 10, 18))).toBe(13)
  })
  it('dernier jour', () => {
    expect(daysLeftInMonth(new Date(2026, 10, 30))).toBe(1)
  })
  it('février bissextile', () => {
    expect(daysLeftInMonth(new Date(2028, 1, 1))).toBe(29)
  })
  it('31 janvier', () => {
    expect(daysLeftInMonth(new Date(2026, 0, 31))).toBe(1)
  })
})

describe('isInMonth', () => {
  it('du 1er au dernier jour', () => {
    expect(isInMonth('2026-11-01', '2026-11')).toBe(true)
    expect(isInMonth('2026-11-30', '2026-11')).toBe(true)
    expect(isInMonth('2026-12-01', '2026-11')).toBe(false)
    expect(isInMonth('2026-10-31', '2026-11')).toBe(false)
  })
})
