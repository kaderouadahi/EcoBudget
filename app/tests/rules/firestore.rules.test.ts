import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-ecobudget',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})
afterAll(async () => { await env.cleanup() })
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, 'users/bob'), { alertsEnabled: true })
    await setDoc(doc(db, 'users/bob/expenses/e1'), { amount: 250 })
  })
})

const alice = () => env.authenticatedContext('alice').firestore()

describe('chacun ses données', () => {
  it('alice écrit puis lit ses propres dépenses', async () => {
    await assertSucceeds(setDoc(doc(alice(), 'users/alice/expenses/e1'), { amount: 250 }))
    await assertSucceeds(getDoc(doc(alice(), 'users/alice/expenses/e1')))
  })
  it('alice écrit et lit ses réglages', async () => {
    await assertSucceeds(setDoc(doc(alice(), 'users/alice'), { alertsEnabled: true }))
    await assertSucceeds(getDoc(doc(alice(), 'users/alice')))
  })
  it('alice ne lit pas les dépenses de bob', async () => {
    await assertFails(getDoc(doc(alice(), 'users/bob/expenses/e1')))
  })
  it('alice ne lit pas les réglages de bob', async () => {
    await assertFails(getDoc(doc(alice(), 'users/bob')))
  })
  it("alice n'écrit pas chez bob", async () => {
    await assertFails(setDoc(doc(alice(), 'users/bob/expenses/x'), { amount: 1 }))
    await assertFails(setDoc(doc(alice(), 'users/bob'), { alertsEnabled: false }))
  })
  it('un visiteur non connecté ne lit rien', async () => {
    const anon = env.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(anon, 'users/bob/expenses/e1')))
  })
  it('aucune écriture hors de users/', async () => {
    await assertFails(setDoc(doc(alice(), 'autre/doc'), { x: 1 }))
  })
})
