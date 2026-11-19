import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useUid } from '../auth/AuthGate'
import type { Budget, Category, Expense, UserDoc } from './model'
import { subscribeCollection, subscribeUserDoc } from './repo'
import { seedIfNeeded } from './seed'

export interface Data {
  categories: Category[]
  expenses: Expense[]
  budgets: Budget[]
  user: UserDoc | null
  ready: boolean
}

const DataContext = createContext<Data | null>(null)

/** Un seul abonnement par collection pour toute l'application ; mis à jour aussi hors connexion. */
export function DataProvider({ children }: { children: ReactNode }) {
  const uid = useUid()
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [user, setUser] = useState<UserDoc | null | undefined>(undefined)

  useEffect(() => {
    const subs = [
      subscribeCollection<Category>(uid, 'categories', (c) => setCategories([...c].sort((a, b) => a.order - b.order))),
      subscribeCollection<Expense>(uid, 'expenses', setExpenses),
      subscribeCollection<Budget>(uid, 'budgets', setBudgets),
      subscribeUserDoc(uid, (u, { fromCache }) => {
        setUser(u)
        // Seulement sur une réponse du serveur : un cache vide ne prouve pas que le compte est neuf.
        if (!fromCache) seedIfNeeded(uid, u)
      }),
    ]
    return () => subs.forEach((unsub) => unsub())
  }, [uid])

  const value = useMemo<Data>(() => ({
    categories: categories ?? [],
    expenses,
    budgets,
    user: user ?? null,
    ready: categories !== null && user !== undefined,
  }), [categories, expenses, budgets, user])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): Data {
  const data = useContext(DataContext)
  if (!data) throw new Error('useData doit être utilisé sous <DataProvider>')
  return data
}
