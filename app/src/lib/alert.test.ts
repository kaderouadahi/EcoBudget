import { describe, expect, it } from 'vitest'
import type { Expense } from '../data/model'
import { checkUnusual, median, referenceHistory, visibleAlert, whySentence } from './alert'

let n = 0
const E = (amount: number, date: string, categoryId = 'sorties'): Expense => ({ id: `e${++n}`, amount, categoryId, date, createdAt: n })
const norm = (s: string) => s.replace(/\s/g, ' ')
const add = (amount: number, date: string, categoryId = 'sorties') => ({ amount, date, categoryId })

describe('median', () => {
  it('impair', () => { expect(median([1000, 800, 1200])).toBe(1000) })
  it('pair : moyenne des deux du milieu', () => { expect(median([800, 900, 1000, 1100])).toBe(950) })
})

describe('referenceHistory', () => {
  it('moins de 5 dépenses : pas d’historique', () => {
    const all = [E(1000, '2026-11-01'), E(1000, '2026-11-02'), E(1000, '2026-11-03'), E(1000, '2026-11-04')]
    expect(referenceHistory(add(4500, '2026-11-19'), all)).toBeNull()
  })

  it('5 ou plus dans les 8 semaines : toutes prises', () => {
    const all = ['2026-10-01', '2026-10-08', '2026-10-15', '2026-10-22', '2026-11-01', '2026-11-10'].map((d) => E(1000, d))
    expect(referenceHistory(add(4500, '2026-11-19'), all)).toHaveLength(6)
  })

  it('fenêtre de 8 semaines comptée depuis la date de la dépense (56 jours inclus)', () => {
    const all = ['2026-09-24', '2026-10-01', '2026-10-08', '2026-10-15', '2026-10-22', '2026-11-01'].map((d) => E(1000, d))
    // 2026-11-19 − 56 jours = 2026-09-24 : incluse ; les 6 dans la fenêtre
    expect(referenceHistory(add(4500, '2026-11-19'), all)).toHaveLength(6)
  })

  it('moins de 5 dans les 8 semaines : les 5 dernières si la plus ancienne a moins de 6 mois', () => {
    const all = ['2026-06-01', '2026-06-20', '2026-07-10', '2026-08-05', '2026-11-01', '2026-11-10'].map((d) => E(1000, d))
    const h = referenceHistory(add(4500, '2026-11-19'), all)!
    expect(h.map((e) => e.date).sort()).toEqual(['2026-06-20', '2026-07-10', '2026-08-05', '2026-11-01', '2026-11-10'])
  })

  it('plus ancienne des 5 à plus de 6 mois : pas d’historique', () => {
    const all = ['2026-05-18', '2026-07-10', '2026-08-05', '2026-11-01', '2026-11-10'].map((d) => E(1000, d))
    expect(referenceHistory(add(4500, '2026-11-19'), all)).toBeNull()
  })

  it('limite des 6 mois en fin de mois : 31 août → 28 février (pas de débordement sur mars)', () => {
    const all = ['2026-03-01', '2026-04-15', '2026-05-20', '2026-08-10', '2026-08-20'].map((d) => E(1000, d))
    expect(referenceHistory(add(4500, '2026-08-31'), all)).toHaveLength(5)
    const tooOld = ['2026-02-28', '2026-04-15', '2026-05-20', '2026-08-10', '2026-08-20'].map((d) => E(1000, d))
    expect(referenceHistory(add(4500, '2026-08-31'), tooOld)).toBeNull()
  })

  it('dépense saisie avec une date passée : les dépenses d’après sont exclues', () => {
    const all = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-11-10', '2026-11-12'].map((d) => E(1000, d))
    expect(referenceHistory(add(4500, '2026-10-06'), all)).toHaveLength(5)
  })

  it('même jour compris, autres catégories ignorées', () => {
    const all = [...['2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19'].map((d) => E(1000, d)), E(1000, '2026-11-19', 'repas')]
    expect(referenceHistory(add(4500, '2026-11-19'), all)).toHaveLength(5)
  })
})

describe('checkUnusual', () => {
  const five = (amount: number) => ['2026-11-01', '2026-11-03', '2026-11-05', '2026-11-07', '2026-11-09'].map((d) => E(amount, d))

  it('S4 : 4 500 contre une médiane de 1 000 → alerte, 4,5 fois', () => {
    const r = checkUnusual(add(4500, '2026-11-14'), five(1000))!
    expect(r.median).toBe(1000)
    expect(r.ratio).toBe(4.5)
    expect(r.history).toHaveLength(5)
  })
  it('exactement 3 × la médiane : pas d’alerte', () => {
    expect(checkUnusual(add(3000, '2026-11-14'), five(1000))).toBeNull()
  })
  it('café : 200 DA contre 50 → 4 fois mais 150 DA de plus → pas d’alerte', () => {
    expect(checkUnusual(add(200, '2026-11-14'), five(50))).toBeNull()
  })
  it('juste au seuil des 1 000 DA de plus : alerte', () => {
    expect(checkUnusual(add(1400, '2026-11-14'), five(400))).not.toBeNull()
  })
  it('pas assez d’historique : pas d’alerte', () => {
    expect(checkUnusual(add(99000, '2026-11-14'), five(1000).slice(0, 4))).toBeNull()
  })
})

describe('whySentence', () => {
  it('phrase S4 mot pour mot', () => {
    expect(norm(whySentence('Sorties', 1000, 4.5, 16, '2026-09-21', '2026-11-14'))).toBe(
      "D'habitude, une dépense en Sorties est d'environ 1 000 DA. Celle-ci est 4,5 fois plus élevée. Calcul fait sur vos 16 dépenses en Sorties depuis le 21 septembre.",
    )
  })
  it('médiane arrondie à la centaine, rapport à une décimale avec virgule', () => {
    const s = norm(whySentence('Courses', 1260, 7000 / 1260, 8, '2026-10-02', '2026-11-14'))
    expect(s).toContain("d'environ 1 300 DA")
    expect(s).toContain('5,6 fois')
  })
  it('« 1er » pour le premier du mois', () => {
    expect(norm(whySentence('Sorties', 1000, 4.5, 5, '2026-10-01', '2026-11-14'))).toContain('depuis le 1er octobre.')
  })
  it('année ajoutée si différente de celle de la dépense', () => {
    expect(norm(whySentence('Santé', 2000, 5, 5, '2025-12-24', '2026-03-10'))).toContain('depuis le 24 décembre 2025.')
  })
  it('petite médiane : pas « environ 0 DA »', () => {
    expect(norm(whySentence('Repas', 40, 30, 5, '2026-11-01', '2026-11-14'))).toContain("d'environ 40 DA")
  })
})

describe('jeu de démo innovation.md §5.2', () => {
  const SORTIES: Record<string, [number, number][]> = {
    '2026-07': [[3, 800], [9, 900], [15, 1000], [21, 1100], [26, 1200]],
    '2026-08': [[2, 600], [8, 900], [14, 1000], [20, 1100], [27, 1200]],
    '2026-09': [[4, 700], [10, 1000], [16, 1000], [22, 1200], [27, 1300]],
    '2026-10': [[2, 600], [6, 800], [10, 1000], [14, 1000], [18, 1000], [22, 1200], [27, 1400]],
  }
  const data = Object.entries(SORTIES).flatMap(([m, list]) => list.map(([d, a]) => E(a, `${m}-${String(d).padStart(2, '0')}`)))

  for (const day of [1, 10, 19, 28]) {
    it(`4 500 DA en Sorties le ${day} novembre : environ 1 000 DA et 4,5 fois`, () => {
      const date = `2026-11-${String(day).padStart(2, '0')}`
      const r = checkUnusual(add(4500, date), data)!
      expect(r).not.toBeNull()
      const s = norm(whySentence('Sorties', r.median, r.ratio, r.history.length, r.history.map((e) => e.date).sort()[0], date))
      expect(s).toContain("d'environ 1 000 DA")
      expect(s).toContain('4,5 fois')
    })
  }
})

describe('visibleAlert', () => {
  const exp = E(4500, '2026-11-14')
  const alert = { expenseId: exp.id, amount: 4500, categoryId: 'sorties', date: '2026-11-14', why: '…' }
  it('dépense identique : carte affichée', () => { expect(visibleAlert(alert, [exp])).toEqual(alert) })
  it('dépense supprimée : pas de carte', () => { expect(visibleAlert(alert, [])).toBeNull() })
  it('montant, catégorie ou date modifiés : pas de carte', () => {
    expect(visibleAlert(alert, [{ ...exp, amount: 450 }])).toBeNull()
    expect(visibleAlert(alert, [{ ...exp, categoryId: 'repas' }])).toBeNull()
    expect(visibleAlert(alert, [{ ...exp, date: '2026-11-13' }])).toBeNull()
  })
  it('aucune alerte', () => { expect(visibleAlert(undefined, [exp])).toBeNull() })
})
