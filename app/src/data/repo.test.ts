import { beforeEach, describe, expect, it, vi } from 'vitest'

const DELETE = { __delete: true }
const updateDoc = vi.fn(() => Promise.resolve())
const setDoc = vi.fn(() => Promise.resolve())

vi.mock('../firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: (...path: unknown[]) => ({ path }),
  doc: (...args: unknown[]) => ({ args, id: 'gen-id' }),
  onSnapshot: vi.fn(),
  deleteDoc: vi.fn(() => Promise.resolve()),
  deleteField: () => DELETE,
  updateDoc: (...a: unknown[]) => updateDoc(...(a as [])),
  setDoc: (...a: unknown[]) => setDoc(...(a as [])),
}))

import { createDoc, setUserFields, updateDocFields } from './repo'

describe('repo : champs facultatifs', () => {
  beforeEach(() => { updateDoc.mockClear(); setDoc.mockClear() })

  it('modifier avec une note vidée supprime le champ', () => {
    updateDocFields('u', 'expenses', 'e1', { amount: 250, note: undefined })
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { amount: 250, note: DELETE })
  })

  it('réglages : un champ remis à undefined est supprimé', () => {
    setUserFields('u', { adviceHiddenUntil: undefined })
    expect(setDoc).toHaveBeenCalledWith(expect.anything(), { adviceHiddenUntil: DELETE }, { merge: true })
  })

  it('création : les champs undefined sont simplement omis', () => {
    createDoc('u', 'expenses', { amount: 250, note: undefined })
    expect(setDoc).toHaveBeenCalledWith(expect.anything(), { amount: 250 })
  })
})
