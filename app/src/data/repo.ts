import { collection, deleteDoc, deleteField, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { CollectionName, UserDoc } from './model'

// Écritures « fire-and-forget » : la promesse Firestore ne se résout qu'à l'accusé du serveur,
// donc l'interface ne l'attend jamais. Le cache local met à jour onSnapshot immédiatement,
// y compris hors connexion.
const report = (e: unknown) => console.error('[EcoBudget] écriture Firestore', e)

const col = (uid: string, name: CollectionName) => collection(db, 'users', uid, name)

export function subscribeCollection<T extends { id: string }>(
  uid: string,
  name: CollectionName,
  cb: (items: T[]) => void,
): () => void {
  return onSnapshot(col(uid, name), (snap) => {
    cb(snap.docs.map((d) => ({ ...(d.data() as Omit<T, 'id'>), id: d.id }) as T))
  }, report)
}

export function subscribeUserDoc(uid: string, cb: (u: UserDoc | null) => void): () => void {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    cb(snap.exists() ? (snap.data() as UserDoc) : null)
  }, report)
}

/** Crée (ou remplace) un document et renvoie son id tout de suite. */
export function createDoc(uid: string, name: CollectionName, data: object, id?: string): string {
  const ref = id ? doc(col(uid, name), id) : doc(col(uid, name))
  setDoc(ref, stripUndefined(data)).catch(report)
  return ref.id
}

export function updateDocFields(uid: string, name: CollectionName, id: string, patch: object): void {
  updateDoc(doc(col(uid, name), id), undefinedToDelete(patch)).catch(report)
}

export function removeDoc(uid: string, name: CollectionName, id: string): void {
  deleteDoc(doc(col(uid, name), id)).catch(report)
}

export function setUserFields(uid: string, patch: Partial<UserDoc>): void {
  setDoc(doc(db, 'users', uid), undefinedToDelete(patch), { merge: true }).catch(report)
}

// Modification : un champ remis à undefined (ex. note vidée) est supprimé du document.
function undefinedToDelete(o: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v === undefined ? deleteField() : v]))
}

// Création : Firestore refuse les champs undefined (ex. note facultative vide), on les omet.
function stripUndefined(o: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined))
}
