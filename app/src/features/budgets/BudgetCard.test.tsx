import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BudgetCard } from './BudgetCard'
import { StatusChip } from './StatusChip'

const norm = (s: string | null) => (s ?? '').replace(/\s/g, ' ')

describe('StatusChip : jamais la couleur seule', () => {
  it('vert : icône + « Dans le budget »', () => {
    render(<StatusChip kind="ok" remaining={4750} />)
    expect(screen.getByText('Dans le budget')).toBeInTheDocument()
    expect(screen.getByTestId('status-icon')).toBeInTheDocument()
  })
  it('orange : icône + « Il reste X DA »', () => {
    const { container } = render(<StatusChip kind="warn" remaining={6000} />)
    expect(norm(container.textContent)).toBe('Il reste 6 000 DA')
    expect(screen.getByTestId('status-icon')).toBeInTheDocument()
  })
  it('rouge : icône + « Dépassé de X DA »', () => {
    const { container } = render(<StatusChip kind="over" remaining={-900} />)
    expect(norm(container.textContent)).toBe('Dépassé de 900 DA')
    expect(screen.getByTestId('status-icon')).toBeInTheDocument()
  })
})

describe('BudgetCard', () => {
  it('nom, « X sur Y », état, lien vers le détail', () => {
    const { container } = render(
      <MemoryRouter>
        <BudgetCard
          category={{ id: 'courses', name: 'Courses', icon: 'ShoppingCart', order: 1, locked: false }}
          row={{ categoryId: 'courses', amount: 40000, spent: 34000, kind: 'warn', remaining: 6000, percent: 85 }}
        />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/budgets/courses')
    expect(norm(container.textContent)).toContain('34 000 DA sur 40 000 DA')
    expect(norm(container.textContent)).toContain('Il reste 6 000 DA')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '85')
  })
})
