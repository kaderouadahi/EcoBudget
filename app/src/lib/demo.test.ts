import { describe, expect, it } from 'vitest'
import { noticeAfterAdd } from '../features/expenses/useExpenseNotice'
import { adviceText, computeAdvice } from './advice'
import { checkUnusual, whySentence } from './alert'
import { spentByCategory } from './budget'
import { buildDemoData } from './demo'
import { savedAmount } from './goals'
import { addMonths, currentMonth, toISODate } from './month'

const norm = (s: string) => s.replace(/\s/g, ' ')
const USER = { alertsEnabled: true, adviceEnabled: true, onboardingDone: true }

function checkDay(today: Date) {
  const demo = buildDemoData(today)
  const date = toISODate(today)
  const added = { id: 'new', amount: 4500, categoryId: 'sorties', date }

  const hit = checkUnusual(added, demo.expenses)
  expect(hit, `alerte le ${date}`).not.toBeNull()
  const oldest = hit!.history.map((e) => e.date).sort()[0]
  const why = norm(whySentence('Sorties', hit!.median, hit!.ratio, hit!.history.length, oldest, date))
  expect(why).toContain("d'environ 1 000 DA")
  expect(why).toContain('4,5 fois')

  const notice = noticeAfterAdd(demo.expenses, demo.budgets, added, 'Sorties', today)
  expect(norm(notice?.text ?? '')).toBe('Sorties : il reste 500 DA')

  const advice = computeAdvice({ ...demo, user: USER, today })
  expect(advice, `conseil le ${date}`).not.toBeNull()
  expect(advice!.categoryId).toBe('sorties')
  expect(advice!.reduction).toBe(2000)
  expect(advice!.goalName).toBe('Ordinateur portable')
  expect(advice!.gain).toBe(1)
  expect(norm(adviceText(advice!))).toBe('En réduisant vos sorties de 2 000 DA par mois, vous atteindriez « Ordinateur portable » un mois plus tôt.')
}

describe('jeu de démo : alerte, message de budget et conseil chaque jour', () => {
  for (let d = 1; d <= 31; d++) it(`janvier 2027, le ${d}`, () => checkDay(new Date(2027, 0, d)))
  for (let d = 1; d <= 28; d++) it(`février 2027, le ${d}`, () => checkDay(new Date(2027, 1, d)))
  it('29 février 2028', () => checkDay(new Date(2028, 1, 29)))
  for (const d of [1, 20, 30]) it(`novembre 2026, le ${d}`, () => checkDay(new Date(2026, 10, d)))
})

describe('contenu du jeu de démo', () => {
  const today = new Date(2026, 10, 20)
  const demo = buildDemoData(today)
  const M = currentMonth(today)

  it('totaux mensuels de M-4 à M-1', () => {
    for (const k of [4, 3, 2, 1]) {
      const t = spentByCategory(demo.expenses, addMonths(M, -k))
      expect(t.get('sorties')).toBe({ 4: 5000, 3: 4800, 2: 5200, 1: 7000 }[k])
      expect(t.get('courses')).toBe(30000)
      expect(t.get('transport')).toBe(3000)
      expect(t.get('repas')).toBe(6000)
      expect(t.get('sante') ?? 0).toBe(0)
    }
  })

  it('mois en cours : pas de Sorties, rien après aujourd’hui', () => {
    const inM = demo.expenses.filter((e) => e.date.startsWith(M))
    expect(inM.some((e) => e.categoryId === 'sorties')).toBe(false)
    expect(inM.every((e) => e.date <= '2026-11-20')).toBe(true)
    // Courses 3, 10, 17 ; Transport 2, 7, 12, 17 ; Repas 1, 5, 8, 12, 15, 19
    expect(spentByCategory(demo.expenses, M).get('courses')).toBe(22500)
    expect(spentByCategory(demo.expenses, M).get('transport')).toBe(2000)
    expect(spentByCategory(demo.expenses, M).get('repas')).toBe(4500)
  })

  it('budgets, objectifs et versements', () => {
    expect(Object.fromEntries(demo.budgets.map((b) => [b.id, b.amount]))).toEqual({ courses: 40000, repas: 8000, transport: 4000, sorties: 5000 })
    const pc = demo.goals.find((g) => g.name === 'Ordinateur portable')!
    const res = demo.goals.find((g) => g.name === 'Réserve de sécurité')!
    expect(pc).toMatchObject({ target: 150000, targetMonth: addMonths(M, 7) })
    expect(res).toMatchObject({ target: 50000, targetMonth: addMonths(M, 13) })
    expect(pc.createdAt).toBeLessThan(new Date(2026, 6, 1).getTime())
    expect(savedAmount(pc.id, demo.contributions)).toBe(90000)
    expect(savedAmount(res.id, demo.contributions)).toBe(12000)
    expect(demo.contributions.filter((c) => c.goalId === pc.id).map((c) => c.date).sort())
      .toEqual(['2026-07-28', '2026-08-28', '2026-09-28', '2026-10-28'])
  })

  it('catégories par défaut, ids uniques, même résultat à chaque appel', () => {
    expect(demo.categories.map((c) => c.id)).toEqual(['repas', 'courses', 'transport', 'sorties', 'sante', 'logement', 'etudes', 'autres'])
    const ids = demo.expenses.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(buildDemoData(today)).toEqual(demo)
  })
})
