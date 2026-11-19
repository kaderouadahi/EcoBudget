import { DEFAULT_CATEGORIES } from './defaults'
import type { UserDoc } from './model'
import { createDoc, setUserFields } from './repo'

/** Première ouverture : catégories prêtes, rien à configurer (B11, C2). Idempotent grâce aux ids fixes. */
export function seedIfNeeded(uid: string, user: UserDoc | null): void {
  if (user?.seeded) return
  for (const { id, ...data } of DEFAULT_CATEGORIES) createDoc(uid, 'categories', data, id)
  setUserFields(uid, { seeded: true, alertsEnabled: true, adviceEnabled: true, onboardingDone: false })
}
