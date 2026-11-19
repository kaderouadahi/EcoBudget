import { beforeEach, describe, expect, it, vi } from 'vitest'

const createDoc = vi.fn()
const setUserFields = vi.fn()
vi.mock('./repo', () => ({
  createDoc: (...a: unknown[]) => createDoc(...a),
  setUserFields: (...a: unknown[]) => setUserFields(...a),
}))

import { seedIfNeeded } from './seed'

describe('seedIfNeeded', () => {
  beforeEach(() => { createDoc.mockClear(); setUserFields.mockClear() })

  it('première ouverture : 8 catégories aux ids fixes, Autres verrouillée, réglages par défaut', () => {
    seedIfNeeded('u1', null)
    expect(createDoc).toHaveBeenCalledTimes(8)
    const ids = createDoc.mock.calls.map((c) => c[3])
    expect(ids).toEqual(['repas', 'courses', 'transport', 'sorties', 'sante', 'logement', 'etudes', 'autres'])
    const autres = createDoc.mock.calls.find((c) => c[3] === 'autres')!
    expect(autres[0]).toBe('u1')
    expect(autres[1]).toBe('categories')
    expect(autres[2]).toMatchObject({ name: 'Autres', locked: true })
    expect(autres[2]).not.toHaveProperty('id')
    expect(setUserFields).toHaveBeenCalledWith('u1', {
      seeded: true, alertsEnabled: true, adviceEnabled: true, onboardingDone: false,
    })
  })

  it('déjà initialisé : rien n’est recréé', () => {
    seedIfNeeded('u1', { seeded: true, alertsEnabled: true, adviceEnabled: true, onboardingDone: true })
    expect(createDoc).not.toHaveBeenCalled()
    expect(setUserFields).not.toHaveBeenCalled()
  })
})
