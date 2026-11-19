import { describe, expect, it } from 'vitest'
import type { Expense } from '../../data/model'
import { noticeAfterAdd } from './useExpenseNotice'

const TODAY = new Date(2026, 10, 19)
const E = (amount: number, categoryId: string, date = '2026-11-10'): Expense => ({ id: `${amount}${date}`, amount, categoryId, date, createdAt: 0 })
const budgets = [{ id: 'courses', amount: 40000 }]

describe('noticeAfterAdd', () => {
  it('ajoute la nouvelle dépense à celles du mois de la catégorie', () => {
    const n = noticeAfterAdd([E(27500, 'courses'), E(9000, 'repas')], budgets, { amount: 6500, categoryId: 'courses', date: '2026-11-19' }, 'Courses', TODAY)
    expect(n?.text.replace(/\s/g, ' ')).toBe('Courses : il reste 6 000 DA')
    expect(n?.tone).toBe('warn')
  })
  it('ignore les dépenses des autres mois', () => {
    expect(noticeAfterAdd([E(30000, 'courses', '2026-10-31')], budgets, { amount: 6500, categoryId: 'courses', date: '2026-11-19' }, 'Courses', TODAY)).toBeNull()
  })
  it('dépense datée du mois précédent : pas d’état', () => {
    expect(noticeAfterAdd([E(39000, 'courses')], budgets, { amount: 6500, categoryId: 'courses', date: '2026-10-30' }, 'Courses', TODAY)).toBeNull()
  })
  it('catégorie sans budget : pas d’état', () => {
    expect(noticeAfterAdd([], budgets, { amount: 99999, categoryId: 'repas', date: '2026-11-19' }, 'Repas', TODAY)).toBeNull()
  })
  it('dépassement', () => {
    const n = noticeAfterAdd([E(39000, 'courses')], budgets, { amount: 1900, categoryId: 'courses', date: '2026-11-19' }, 'Courses', TODAY)
    expect(n?.text.replace(/\s/g, ' ')).toBe('Courses : dépassé de 900 DA')
    expect(n?.tone).toBe('danger')
  })
})
