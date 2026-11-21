import { describe, expect, it } from 'vitest'
import type { Expense } from '../data/model'
import { groupByDay, listMonths, monthTotal, summaryLabel } from './expenseList'

// Liste des dépenses du mois (HANDOFF H10) : mois couverts sans limite, groupement par jour, total.
let n = 0
const E = (amount: number, categoryId: string, date: string, createdAt = ++n): Expense => ({ id: `e${++n}`, amount, categoryId, date, createdAt })
const norm = (s: string) => s.replace(/\s/g, ' ')
const today = new Date(2026, 10, 21)

describe('listMonths', () => {
  it('aucune dépense : le mois en cours seul', () => {
    expect(listMonths([], today)).toEqual(['2026-11'])
  })
  it('sans limite de 6 mois : de la plus ancienne dépense au mois en cours', () => {
    const months = listMonths([E(100, 'repas', '2025-01-10'), E(5, 'repas', '2026-11-02')], today)
    expect(months).toHaveLength(23)
    expect(months[0]).toBe('2025-01')
    expect(months[22]).toBe('2026-11')
  })
  it('passage d’année : de novembre à avril', () => {
    expect(listMonths([E(100, 'repas', '2026-11-01')], new Date(2027, 3, 15)))
      .toEqual(['2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04'])
  })
  it('une dépense datée après le mois en cours est ignorée', () => {
    expect(listMonths([E(100, 'repas', '2026-10-05'), E(100, 'repas', '2026-12-02')], today)).toEqual(['2026-10', '2026-11'])
  })
  it('mois demandé plus ancien que la plus ancienne dépense : gardé (dernière dépense du mois supprimée)', () => {
    expect(listMonths([E(100, 'repas', '2026-10-05')], today, '2026-08')).toEqual(['2026-08', '2026-09', '2026-10', '2026-11'])
  })
  it('mois demandé faux, futur ou déjà couvert : ignoré', () => {
    const list = [E(100, 'repas', '2026-10-05')]
    for (const keep of ['2027-01', 'abc', '2026-13', '2026-00', '2026-11', '2026-10', null, undefined]) {
      expect(listMonths(list, today, keep)).toEqual(['2026-10', '2026-11'])
    }
  })
})

describe('groupByDay', () => {
  it('dépenses du 1er et du dernier jour dans le bon mois', () => {
    const list = [E(1, 'repas', '2026-09-30'), E(2, 'repas', '2026-10-01'), E(3, 'repas', '2026-10-31'), E(4, 'repas', '2026-11-01')]
    const groups = groupByDay(list, '2026-10')
    expect(groups.map((g) => g.date)).toEqual(['2026-10-31', '2026-10-01'])
    expect(groups.flatMap((g) => g.expenses.map((e) => e.amount))).toEqual([3, 2])
  })
  it('février bissextile : le 29 dans février, le 1er mars à part', () => {
    const list = [E(1, 'repas', '2028-02-01'), E(2, 'repas', '2028-02-29'), E(3, 'repas', '2028-03-01'), E(4, 'repas', '2028-01-31')]
    expect(groupByDay(list, '2028-02').map((g) => g.date)).toEqual(['2028-02-29', '2028-02-01'])
  })
  it('jours du plus récent au plus ancien ; dans un jour, dernière saisie en premier', () => {
    const list = [E(10, 'repas', '2026-10-15', 1), E(30, 'repas', '2026-10-15', 3), E(99, 'repas', '2026-10-31', 4), E(20, 'repas', '2026-10-15', 2)]
    const groups = groupByDay(list, '2026-10')
    expect(groups.map((g) => g.date)).toEqual(['2026-10-31', '2026-10-15'])
    expect(groups[1].expenses.map((e) => e.createdAt)).toEqual([3, 2, 1])
  })
  it('mois sans dépense : aucun groupe', () => {
    expect(groupByDay([E(1, 'repas', '2026-10-15')], '2026-09')).toEqual([])
  })
})

describe('monthTotal et summaryLabel', () => {
  it('total et nombre des dépenses du mois seulement', () => {
    const list = [E(1000, 'repas', '2026-10-01'), E(2500, 'courses', '2026-10-31'), E(250, 'repas', '2026-10-12'), E(9999, 'repas', '2026-11-01')]
    expect(monthTotal(list, '2026-10')).toEqual({ total: 3750, count: 3 })
  })
  it('mois sans dépense : 0 et 0', () => {
    expect(monthTotal([E(1000, 'repas', '2026-10-01')], '2026-09')).toEqual({ total: 0, count: 0 })
  })
  it('« Total : 29 000 DA · 12 dépenses »', () => {
    expect(norm(summaryLabel(29000, 12))).toBe('Total : 29 000 DA · 12 dépenses')
  })
  it('singulier : « 1 dépense »', () => {
    expect(norm(summaryLabel(250, 1))).toBe('Total : 250 DA · 1 dépense')
  })
})
