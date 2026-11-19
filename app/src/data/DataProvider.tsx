import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useUid } from '../auth/AuthGate'
import type { Budget, Category, Contribution, Expense, Goal, UserDoc } from './model'
import { subscribeCollection, subscribeUserDoc } from './repo'
import { seedIfNeeded } from './seed'

export interface Data {
  categories: Category[]
  expenses: Expense[]
  budgets: Budget[]
  goals: Goal[]
  contributions: Contribution[]
  user: UserDoc | null
  ready: boolean
}

const DataContext = createContext<Data | null>(null)

/** Un seul abonnement par collection pour toute l'application ; mis à jour aussi hors connexion. */
export function DataProvider({ children }: { children: ReactNode }) {
  const uid = useUid()
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [expenses, setExpenses] = useState<Expense[] | null>(null)
  const [budgets, setBudgets] = useState<Budget[] | null>(null)
  const [goals, setGoals] = useState<Goal[] | null>(null)
  const [contributions, setContributions] = useState<Contribution[] | null>(null)
  const [user, setUser] = useState<UserDoc | null | undefined>(undefined)

  useEffect(() => {
    const subs = [
      subscribeCollection<Category>(uid, 'categories', (c) => setCategories([...c].sort((a, b) => a.order - b.order))),
      subscribeCollection<Expense>(uid, 'expenses', setExpenses),
      subscribeCollection<Budget>(uid, 'budgets', setBudgets),
      subscribeCollection<Goal>(uid, 'goals', setGoals),
      subscribeCollection<Contribution>(uid, 'contributions', setContributions),
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
    expenses: expenses ?? [],
    budgets: budgets ?? [],
    goals: goals ?? [],
    contributions: contributions ?? [],
    user: user ?? null,
    // Prêt seulement quand tout est arrivé : sinon « Aucune dépense » ou une catégorie proposée fausse s'affichent un instant.
    ready: categories !== null && expenses !== null && budgets !== null && goals !== null && contributions !== null && user !== undefined,
  }), [categories, expenses, budgets, goals, contributions, user])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): Data {
  const data = useContext(DataContext)
  if (!data) throw new Error('useData doit être utilisé sous <DataProvider>')
  return data
}
