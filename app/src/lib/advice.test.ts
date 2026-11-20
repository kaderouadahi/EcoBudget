import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES } from '../data/defaults'
import type { Category, Contribution, Expense, Goal, UserDoc } from '../data/model'
import { adviceText, adviceWhy, computeAdvice } from './advice'
import { addMonths, currentMonth } from './month'

const norm = (s: string) => s.replace(/\s/g, ' ')
let n = 0
const E = (amount: number, categoryId: string, date: string): Expense => ({ id: `e${++n}`, amount, categoryId, date, createdAt: n })
const G = (id: string, name: string, target: number, targetMonth: string, createdAt = 0): Goal => ({ id, name, target, targetMonth, createdAt })
const C = (goalId: string, amount: number): Contribution => ({ id: `c${++n}`, goalId, amount, date: '2026-01-01', createdAt: 0 })
const USER: UserDoc = { alertsEnabled: true, adviceEnabled: true, onboardingDone: true }

/** Jeu de démo innovation.md §5.2, relatif au mois de `today`. */
function demo(today: Date) {
  const M = currentMonth(today)
  const m = (k: number) => addMonths(M, -k)
  const d = (month: string, day: number) => `${month}-${String(day).padStart(2, '0')}`
  const SORTIES: [number, [number, number][]][] = [
    [4, [[3, 800], [9, 900], [15, 1000], [21, 1100], [26, 1200]]],
    [3, [[2, 600], [8, 900], [14, 1000], [20, 1100], [27, 1200]]],
    [2, [[4, 700], [10, 1000], [16, 1000], [22, 1200], [27, 1300]]],
    [1, [[2, 600], [6, 800], [10, 1000], [14, 1000], [18, 1000], [22, 1200], [27, 1400]]],
  ]
  const expenses: Expense[] = []
  for (const [k, list] of SORTIES) for (const [day, a] of list) expenses.push(E(a, 'sorties', d(m(k), day)))
  for (const k of [4, 3, 2, 1]) {
    for (const day of [5, 15, 25]) expenses.push(E(10000, 'courses', d(m(k), day)))
    for (const day of [7, 21]) expenses.push(E(1500, 'transport', d(m(k), day)))
  }
  const goals = [G('pc', 'Ordinateur portable', 150000, addMonths(M, 7), 1), G('res', 'Réserve de sécurité', 50000, addMonths(M, 13), 2)]
  const contributions = [C('pc', 90000), C('res', 12000)]
  return { expenses, goals, contributions, categories: DEFAULT_CATEGORIES as Category[], user: USER, today, M }
}

describe('jeu de démo §5.2', () => {
  for (const day of [1, 10, 19, 28]) {
    it(`le ${day} du mois : Sorties, 2 000 DA, « Ordinateur portable », un mois plus tôt`, () => {
      const a = computeAdvice(demo(new Date(2026, 10, day)))!
      expect(a).not.toBeNull()
      expect(a.categoryId).toBe('sorties')
      expect(a.reduction).toBe(2000)
      expect(a.goalId).toBe('pc')
      expect(a.months).toBe(7)
      expect(a.needed).toBe(6)
      expect(a.gain).toBe(1)
      expect(norm(adviceText(a))).toBe('En réduisant vos sorties de 2 000 DA par mois, vous atteindriez « Ordinateur portable » un mois plus tôt.')
    })
  }

  it('phrase « Pourquoi ? » S3 mot pour mot', () => {
    const a = computeAdvice(demo(new Date(2026, 10, 20)))!
    expect(norm(adviceWhy(a))).toBe(
      'Pour atteindre « Ordinateur portable » en juin 2027, il faut mettre de côté environ 8 600 DA par mois. ' +
      'Avec 2 000 DA de plus, 6 mois suffiraient au lieu de 7. ' +
      'Le mois dernier, vos dépenses en Sorties ont atteint 7 000 DA, contre environ 5 000 DA d’habitude.'.replace('’', "'"),
    )
  })

  it('prototype : rythme ≈ 8 571 DA', () => {
    const a = computeAdvice(demo(new Date(2026, 10, 20)))!
    expect(Math.round(a.pace)).toBe(8571)
    expect(a.lastMonth).toBe(7000)
    expect(a.usual).toBe(5000)
  })
})

describe('pas de conseil', () => {
  const base = () => demo(new Date(2026, 10, 20))

  it('sans dépense datée de M-4 ou avant', () => {
    const d = base()
    const M4 = addMonths(d.M, -4)
    expect(computeAdvice({ ...d, expenses: d.expenses.filter((e) => !e.date.startsWith(M4)) })).toBeNull()
  })
  it('objectif atteint, date passée ou mois en cours : écarté', () => {
    const d = base()
    const only = (g: Goal, saved: number) => computeAdvice({ ...d, goals: [g], contributions: [C(g.id, saved)] })
    expect(only(G('x', 'X', 150000, addMonths(d.M, 7)), 150000)).toBeNull()
    expect(only(G('x', 'X', 150000, addMonths(d.M, -1)), 90000)).toBeNull()
    expect(only(G('x', 'X', 150000, d.M), 90000)).toBeNull()
  })
  it('objectif en retard plus proche : on prend le plus proche parmi les en cours', () => {
    const d = base()
    const a = computeAdvice({ ...d, goals: [G('late', 'Moto', 100000, addMonths(d.M, -2)), ...d.goals] })!
    expect(a.goalId).toBe('pc')
  })
  it('hausse inférieure à 500 DA', () => {
    const d = base()
    const M1 = addMonths(d.M, -1)
    const expenses = d.expenses.map((e) => (e.categoryId === 'sorties' && e.date.startsWith(M1) && e.amount === 1400 ? { ...e, amount: 0 } : e))
      .map((e) => (e.categoryId === 'sorties' && e.date.startsWith(M1) && e.amount === 1200 ? { ...e, amount: 0 } : e))
    // M-1 = 7 000 − 1 400 − 1 200 = 4 400 → pas de hausse
    expect(computeAdvice({ ...d, expenses })).toBeNull()
  })
  it('hausse de 1 à 499 DA : réduction arrondie à 0, pas de conseil', () => {
    const d = base()
    const M1 = addMonths(d.M, -1)
    // Sorties du mois dernier ramenées à 5 400 (habitude 5 000) : hausse de 400 DA
    const expenses = d.expenses.map((e) => (e.categoryId === 'sorties' && e.date.startsWith(M1) && e.amount === 1400 ? { ...e, amount: 0 } : e))
      .map((e) => (e.categoryId === 'sorties' && e.date.startsWith(M1) && e.amount === 1200 ? { ...e, amount: 1000 } : e))
    expect(computeAdvice({ ...d, expenses })).toBeNull()
  })
  it('gain de 0 mois', () => {
    const d = base()
    // 1 000 000 DA à épargner en 2 mois : 2 000 DA de plus par mois ne fait pas gagner un mois entier
    const goals = [G('g', 'Grand projet', 1000000, addMonths(d.M, 2))]
    expect(computeAdvice({ ...d, goals, contributions: [] })).toBeNull()
  })
  it('conseils désactivés', () => {
    expect(computeAdvice({ ...base(), user: { ...USER, adviceEnabled: false } })).toBeNull()
  })
  it('« Compris » ce mois-ci : masqué ; masqué le mois dernier : revient', () => {
    const d = base()
    expect(computeAdvice({ ...d, user: { ...USER, adviceHiddenUntil: d.M } })).toBeNull()
    expect(computeAdvice({ ...d, user: { ...USER, adviceHiddenUntil: addMonths(d.M, -1) } })).not.toBeNull()
  })
})

describe('catégorie visée', () => {
  const base = () => demo(new Date(2026, 10, 20))
  const M1 = (d: ReturnType<typeof base>) => `${addMonths(d.M, -1)}-15`

  it('Santé, Logement et Autres exclues même avec la plus forte hausse', () => {
    const d = base()
    const expenses = [...d.expenses, E(20000, 'sante', M1(d)), E(30000, 'logement', M1(d)), E(40000, 'autres', M1(d))]
    expect(computeAdvice({ ...d, expenses })!.categoryId).toBe('sorties')
  })
  it('mois sans dépense compté pour 0', () => {
    const d = base()
    // Repas : rien en M-4, M-3 et M-2 (habitude 0), 3 000 en M-1 → hausse 3 000, plus forte que Sorties
    const a = computeAdvice({ ...d, expenses: [...d.expenses, E(3000, 'repas', M1(d))] })!
    expect(a.categoryId).toBe('repas')
    expect(a.usual).toBe(0)
    expect(a.reduction).toBe(3000)
  })
  it('égalité de hausse : la première dans l’ordre des catégories', () => {
    const d = base()
    // Repas (ordre 0) : +2 000 comme Sorties (ordre 3)
    const a = computeAdvice({ ...d, expenses: [...d.expenses, E(2000, 'repas', M1(d))] })!
    expect(a.categoryId).toBe('repas')
  })
  it('nom actuel de la catégorie, en minuscule sur la carte, avec majuscule dans « Pourquoi ? »', () => {
    const d = base()
    const categories = d.categories.map((c) => (c.id === 'sorties' ? { ...c, name: 'Loisirs' } : c))
    const a = computeAdvice({ ...d, categories })!
    expect(adviceText(a)).toContain('vos loisirs de')
    expect(adviceWhy(a)).toContain('vos dépenses en Loisirs ont atteint')
  })
  it('gain de 2 mois : « 2 mois plus tôt »', () => {
    const d = base()
    const a = computeAdvice({ ...d, expenses: [...d.expenses, E(8000, 'sorties', M1(d))] })!
    expect(a.gain).toBeGreaterThanOrEqual(2)
    expect(adviceText(a)).toContain(`« Ordinateur portable » ${a.gain} mois plus tôt.`)
  })
})
