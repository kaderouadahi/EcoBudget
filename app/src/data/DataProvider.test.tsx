import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const cbs: Record<string, (items: unknown[]) => void> = {}
let userCb: (u: unknown, meta: { fromCache: boolean }) => void = () => {}
vi.mock('../auth/AuthGate', () => ({ useUid: () => 'u1' }))
vi.mock('./seed', () => ({ seedIfNeeded: vi.fn() }))
vi.mock('./repo', () => ({
  subscribeCollection: (_uid: string, name: string, cb: (items: unknown[]) => void) => { cbs[name] = cb; return () => {} },
  subscribeUserDoc: (_uid: string, cb: typeof userCb) => { userCb = cb; return () => {} },
}))

import { DataProvider, useData } from './DataProvider'

function Show() {
  const { ready, expenses, budgets } = useData()
  return <p data-testid="s">{ready ? `prêt ${expenses.length} ${budgets.length}` : 'chargement'}</p>
}

describe('DataProvider', () => {
  it('n’est prêt qu’une fois catégories, dépenses, budgets et réglages reçus', () => {
    render(<DataProvider><Show /></DataProvider>)
    act(() => { cbs.categories([]); userCb({ seeded: true }, { fromCache: false }) })
    expect(screen.getByTestId('s')).toHaveTextContent('chargement')
    act(() => cbs.expenses([{ id: 'e' }]))
    expect(screen.getByTestId('s')).toHaveTextContent('chargement')
    act(() => cbs.budgets([]))
    expect(screen.getByTestId('s')).toHaveTextContent('prêt 1 0')
  })
})
