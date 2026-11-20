import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES } from '../data/defaults'
import type { Category, Expense } from '../data/model'
import { breakdown, categoryColor, CHART_COLORS, coveredMonths, monthlyTotals, percentLabel, shortMonth } from './charts'
import { buildDemoData } from './demo'
import { formatNumber } from './format'
import { addMonths, currentMonth, toISODate } from './month'

let n = 0
const E = (amount: number, categoryId: string, date: string): Expense => ({ id: `e${++n}`, amount, categoryId, date, createdAt: n })
const CATS = DEFAULT_CATEGORIES as Category[]
const norm = (s: string) => s.replace(/\s/g, ' ')

describe('coveredMonths', () => {
  const today = new Date(2026, 10, 20)
  it('aucune dépense : le mois en cours seul', () => {
    expect(coveredMonths([], today)).toEqual(['2026-11'])
  })
  it('6 mois au plus', () => {
    expect(coveredMonths([E(100, 'repas', '2025-01-10')], today)).toEqual(['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'])
  })
  it('pas avant le mois de la plus ancienne dépense', () => {
    expect(coveredMonths([E(100, 'repas', '2026-09-30'), E(5, 'repas', '2026-11-02')], today)).toEqual(['2026-09', '2026-10', '2026-11'])
  })
  it('passage d’année : de novembre à avril', () => {
    expect(coveredMonths([E(100, 'repas', '2026-11-01')], new Date(2027, 3, 15))).toEqual(['2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04'])
  })
  it('janvier : remonte sur l’année précédente', () => {
    expect(coveredMonths([E(100, 'repas', '2025-06-01')], new Date(2027, 0, 5))).toEqual(['2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01'])
  })
})

describe('monthlyTotals', () => {
  const expenses = [
    E(1000, 'repas', '2026-10-01'), E(2000, 'sorties', '2026-10-31'), // 1er et dernier jour d'octobre
    E(500, 'repas', '2026-11-01'), E(300, 'supprimee', '2026-11-05'), E(200, 'autres', '2026-11-06'),
  ]
  const months = ['2026-09', '2026-10', '2026-11']
  it('toutes les dépenses ; mois sans dépense = 0 ; 1er et dernier jour dans le bon mois', () => {
    expect(monthlyTotals(expenses, CATS, months, null)).toEqual([
      { month: '2026-09', total: 0 }, { month: '2026-10', total: 3000 }, { month: '2026-11', total: 1000 },
    ])
  })
  it('par catégorie', () => {
    expect(monthlyTotals(expenses, CATS, months, 'sorties').map((t) => t.total)).toEqual([0, 2000, 0])
    expect(monthlyTotals(expenses, CATS, months, 'repas').map((t) => t.total)).toEqual([0, 1000, 500])
  })
  it('catégorie inconnue comptée dans Autres', () => {
    expect(monthlyTotals(expenses, CATS, months, 'autres').map((t) => t.total)).toEqual([0, 0, 500])
  })
})

describe('breakdown et percentLabel', () => {
  it('pourcentages arrondis, catégorie seule = 100 %, « moins de 1 % »', () => {
    expect(percentLabel(30000, 46000)).toBe('65 %')
    expect(percentLabel(3000, 46000)).toBe('7 %')
    expect(percentLabel(500, 500)).toBe('100 %')
    expect(percentLabel(40, 10000)).toBe('moins de 1 %')
    expect(percentLabel(50, 10000)).toBe('1 %')
  })
  it('jamais « 100 % » tant que la catégorie n’est pas seule (plafond 99 %, comme H2 et H4)', () => {
    expect(percentLabel(9960, 10000)).toBe('99 %')
    expect(percentLabel(9999, 10000)).toBe('99 %')
    expect(percentLabel(10000, 10000)).toBe('100 %')
  })
  it('ordre : montant décroissant, puis ordre des catégories ; catégorie inconnue dans Autres', () => {
    const b = breakdown([
      E(1000, 'transport', '2026-11-03'), E(3000, 'courses', '2026-11-04'), E(1000, 'repas', '2026-11-05'),
      E(300, 'supprimee', '2026-11-05'), E(20, 'autres', '2026-11-06'), E(9999, 'courses', '2026-10-31'),
    ], CATS, '2026-11')
    expect(b.total).toBe(5320)
    expect(b.rows.map((r) => [r.categoryId, r.name, r.amount])).toEqual([
      ['courses', 'Courses', 3000], ['repas', 'Repas', 1000], ['transport', 'Transport', 1000], ['autres', 'Autres', 320],
    ])
    expect(b.rows.map((r) => r.percent)).toEqual(['56 %', '19 %', '19 %', '6 %'])
  })
  it('catégorie seule : 100 %', () => {
    expect(breakdown([E(750, 'repas', '2026-11-01')], CATS, '2026-11').rows).toEqual([
      { categoryId: 'repas', name: 'Repas', amount: 750, percent: '100 %' },
    ])
  })
  it('mois sans dépense : total 0, aucune ligne', () => {
    expect(breakdown([], CATS, '2026-11')).toEqual({ total: 0, rows: [] })
  })
})

describe('libellés et couleurs', () => {
  it('mois abrégés', () => {
    const all = Array.from({ length: 12 }, (_, i) => shortMonth(`2027-${String(i + 1).padStart(2, '0')}`))
    expect(all).toEqual(['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'])
  })
  it('montants sans « DA »', () => {
    expect(norm(formatNumber(44000))).toBe('44 000')
    expect(formatNumber(0)).toBe('0')
  })
  it('couleur fixe par catégorie, selon l’ordre des catégories (pas le rang dans le mois)', () => {
    expect(categoryColor('repas', CATS)).toBe(CHART_COLORS[0])
    expect(categoryColor('courses', CATS)).toBe(CHART_COLORS[1])
    expect(categoryColor('sorties', CATS)).toBe(CHART_COLORS[3])
    // les 6 premières catégories ont chacune leur nuance
    const firstSix = ['repas', 'courses', 'transport', 'sorties', 'sante', 'logement'].map((id) => categoryColor(id, CATS))
    expect(new Set(firstSix).size).toBe(6)
    // au-delà, les nuances se répètent ; catégorie inconnue = couleur d'Autres
    expect(categoryColor('etudes', CATS)).toBe(CHART_COLORS[6 % CHART_COLORS.length])
    expect(categoryColor('supprimee', CATS)).toBe(categoryColor('autres', CATS))
    // ordre fourni dans le désordre : même résultat
    expect(categoryColor('sorties', [...CATS].reverse())).toBe(CHART_COLORS[3])
  })
  it('jamais les couleurs des budgets', () => {
    const budget = ['#2F7D5B', '#D9961A', '#8A5300', '#B83E27']
    expect(CHART_COLORS.length).toBeGreaterThanOrEqual(4)
    for (const c of CHART_COLORS) expect(budget).not.toContain(c.toUpperCase())
  })
})

describe('jeu de démo (H8), quel que soit le jour', () => {
  function check(today: Date) {
    const demo = buildDemoData(today)
    const M = currentMonth(today)
    const months = coveredMonths(demo.expenses, today)
    expect(months).toEqual([-4, -3, -2, -1, 0].map((k) => addMonths(M, k)))
    expect(monthlyTotals(demo.expenses, demo.categories, months, null).slice(0, 4).map((t) => t.total)).toEqual([44000, 43800, 44200, 46000])
    expect(monthlyTotals(demo.expenses, demo.categories, months, 'sorties').map((t) => t.total)).toEqual([5000, 4800, 5200, 7000, 0])
    const after = [...demo.expenses, E(4500, 'sorties', toISODate(today))]
    expect(monthlyTotals(after, demo.categories, months, 'sorties')[4].total).toBe(4500)
    const b = breakdown(demo.expenses, demo.categories, addMonths(M, -1))
    expect(b.total).toBe(46000)
    expect(b.rows.map((r) => [r.name, r.amount, r.percent])).toEqual([
      ['Courses', 30000, '65 %'], ['Sorties', 7000, '15 %'], ['Repas', 6000, '13 %'], ['Transport', 3000, '7 %'],
    ])
  }
  for (let d = 1; d <= 31; d++) it(`janvier 2027, le ${d}`, () => check(new Date(2027, 0, d)))
  for (let d = 1; d <= 28; d++) it(`février 2027, le ${d}`, () => check(new Date(2027, 1, d)))
})
