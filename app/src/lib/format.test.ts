import { describe, expect, it } from 'vitest'
import { formatDA, formatDay, formatDayHeading, formatMonthTitle, monthName } from './format'

describe('formatDA', () => {
  it('sépare les milliers et ajoute DA', () => {
    expect(formatDA(34000)).toBe('34 000 DA')
  })
  it('petit montant', () => {
    expect(formatDA(250)).toBe('250 DA')
  })
  it('zéro', () => {
    expect(formatDA(0)).toBe('0 DA')
  })
  it('millions', () => {
    expect(formatDA(1234567)).toBe('1 234 567 DA')
  })
  it('valeur absente ou invalide : pas de « NaN »', () => {
    expect(formatDA(Number.NaN)).toBe(String.fromCharCode(0x2014, 0xa0) + 'DA')
  })
  it('négatif avec le vrai signe moins', () => {
    expect(formatDA(-250)).toBe('−250 DA')
    expect(formatDA(-6500)).toBe('−6 500 DA')
  })
})

describe('formatDay', () => {
  const today = new Date(2026, 10, 19) // jeudi 19 novembre 2026
  it('Aujourd’hui', () => {
    expect(formatDay('2026-11-19', today)).toBe("Aujourd'hui")
  })
  it('Hier', () => {
    expect(formatDay('2026-11-18', today)).toBe('Hier')
  })
  it('jour de la semaine dans les 6 derniers jours', () => {
    expect(formatDay('2026-11-14', today)).toBe('Samedi')
    expect(formatDay('2026-11-13', today)).toBe('Vendredi')
  })
  it('date complète au-delà', () => {
    expect(formatDay('2026-11-01', today)).toBe('dimanche 1er novembre')
    expect(formatDay('2026-11-02', today)).toBe('lundi 2 novembre')
  })
  it('année ajoutée si différente', () => {
    expect(formatDay('2025-12-24', today)).toBe('mercredi 24 décembre 2025')
  })
})

describe('mois', () => {
  it('titre du mois', () => {
    expect(formatMonthTitle('2026-11')).toBe('Novembre 2026')
  })
  it('nom du mois', () => {
    expect(monthName('2026-11')).toBe('novembre')
    expect(monthName('2026-08')).toBe('août')
  })
})

describe('formatDayHeading (intertitres de la liste des dépenses, H10)', () => {
  const today = new Date(2026, 10, 21) // samedi 21 novembre 2026
  it('« Aujourd’hui » et « Hier »', () => {
    expect(formatDayHeading('2026-11-21', today)).toBe("Aujourd'hui")
    expect(formatDayHeading('2026-11-20', today)).toBe('Hier')
  })
  it('dans la semaine en cours : jour et date, jamais le jour seul', () => {
    expect(formatDayHeading('2026-11-19', today)).toBe('jeudi 19 novembre')
    expect(formatDayHeading('2026-11-15', today)).toBe('dimanche 15 novembre')
  })
  it('« 1er » pour le premier jour du mois', () => {
    expect(formatDayHeading('2026-11-01', today)).toBe('dimanche 1er novembre')
  })
  it('année ajoutée si elle diffère', () => {
    expect(formatDayHeading('2025-12-31', today)).toBe('mercredi 31 décembre 2025')
  })
})
