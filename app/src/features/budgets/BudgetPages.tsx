import { Pencil, Plus, Settings2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useUid } from '../../auth/AuthGate'
import { categoryIcon } from '../../data/defaults'
import { useData } from '../../data/DataProvider'
import type { Category } from '../../data/model'
import { createDoc, removeDoc, setUserFields, updateDocFields } from '../../data/repo'
import { budgetSummary, type BudgetSummary } from '../../lib/budget'
import { sortByRecent } from '../../lib/expenses'
import { formatDA, formatMonthTitle } from '../../lib/format'
import { currentMonth, isInMonth } from '../../lib/month'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { useToast } from '../../ui/Toast'
import { ExpenseList } from '../expenses/ExpenseList'
import { useClose } from '../expenses/useClose'
import { BudgetCard } from './BudgetCard'
import { BUDGET_HELP, BudgetForm } from './BudgetForm'
import { ProgressBar, StatusChip } from './StatusChip'
import './budgets.css'

function useSummary(): { summary: BudgetSummary; categories: Category[]; month: string; ready: boolean } {
  const { budgets, categories, expenses, ready } = useData()
  const month = currentMonth(new Date())
  return { summary: budgetSummary(budgets, categories, expenses, month), categories, month, ready }
}

/** « Hors budget : Santé 1 800 DA » : dépenses du mois des catégories sans budget (DECISIONS.md 17/11). */
export function OffBudgetList({ summary, categories }: { summary: BudgetSummary; categories: Category[] }) {
  const byId = new Map(categories.map((c) => [c.id, c]))
  return (
    <>
      {summary.offBudget.map((o) => {
        const c = byId.get(o.categoryId)
        const Icon = categoryIcon(c?.icon)
        return (
          <p key={o.categoryId} className="off-budget">
            <Icon aria-hidden size={18} />
            <span>Hors budget : {c?.name ?? 'Autres'}</span>
            <strong>{formatDA(o.spent)}</strong>
          </p>
        )
      })}
    </>
  )
}

export function BudgetsPage() {
  const { summary, categories, month, ready } = useSummary()
  if (!ready) return null
  const byId = new Map(categories.map((c) => [c.id, c]))
  const canAdd = summary.rows.length < categories.length
  return (
    <div className="home">
      <header>
        <h1>Budgets</h1>
        <p className="home-month">{formatMonthTitle(month)}</p>
      </header>
      {summary.rows.length === 0 && (
        <p className="muted">
          Aucun budget pour l'instant. Un budget est facultatif : fixez-en un pour être prévenu avant de le dépasser.
        </p>
      )}
      <div className="budget-list">
        {summary.rows.map((r) => <BudgetCard key={r.categoryId} showPercent category={byId.get(r.categoryId)!} row={r} />)}
        <OffBudgetList summary={summary} categories={categories} />
      </div>
      {canAdd && (
        <Link to="/budgets/fixer" className="outline-button">
          <Plus aria-hidden size={22} />
          Fixer un budget pour une catégorie
        </Link>
      )}
      {/* H11 : même lien que dans le formulaire Dépense. */}
      <Link to="/reglages#categories" className="manage-link">
        <Settings2 aria-hidden size={18} />
        Gérer les catégories
      </Link>
    </div>
  )
}

export function BudgetDetail() {
  const { categoryId = '' } = useParams()
  const { summary, categories, month, ready } = useSummary()
  const { expenses } = useData()
  if (!ready) return null
  const category = categories.find((c) => c.id === categoryId)
  const row = summary.rows.find((r) => r.categoryId === categoryId)
  // Budget retiré (ou catégorie disparue) : retour à la liste plutôt qu'une page vide.
  if (!category || !row) return <Navigate to="/budgets" replace />
  const Icon = categoryIcon(category.icon)
  const list = sortByRecent(expenses.filter((e) => e.categoryId === categoryId && isInMonth(e.date, month))).slice(0, 10)
  return (
    <div className="home">
      <header>
        <h1>Budget {category.name}</h1>
        <p className="home-month">{formatMonthTitle(month)}</p>
      </header>
      <section className="budget-card">
        <span className="budget-card-top">
          <span className="round-icon"><Icon aria-hidden size={22} /></span>
          <span className="budget-card-text">
            <strong>{category.name}</strong>
            <span className="muted">{formatDA(row.spent)} sur {formatDA(row.amount)} · {row.percent} %</span>
          </span>
          <Link to={`/budgets/${categoryId}/modifier`} className="small-button">
            <Pencil aria-hidden size={18} />
            Modifier
          </Link>
        </span>
        <ProgressBar kind={row.kind} spent={row.spent} amount={row.amount} percent={row.percent} />
        <StatusChip kind={row.kind} remaining={row.remaining} />
        <p className="muted">{BUDGET_HELP}</p>
      </section>
      <section className="home-section">
        <h2 className="section-title">Dernières dépenses {category.name}</h2>
        {list.length > 0 ? (
          <ExpenseList label={`Dernières dépenses ${category.name}`} expenses={list} categories={categories} today={new Date()} />
        ) : (
          <p className="muted">Aucune dépense {category.name} ce mois-ci.</p>
        )}
      </section>
    </div>
  )
}

export function SetBudget() {
  const uid = useUid()
  const { categories, budgets, user, ready } = useData()
  const { show, dismiss } = useToast()
  const navigate = useNavigate()
  const close = useClose()
  const [params] = useSearchParams()
  useEffect(() => dismiss(), [dismiss])
  if (!ready) return null
  const taken = new Set(budgets.map((b) => b.id))
  const choices = categories.filter((c) => !taken.has(c.id))
  if (choices.length === 0) {
    return <p className="muted">Toutes vos catégories ont déjà un budget. <Link to="/budgets">Voir les budgets</Link></p>
  }
  const wanted = params.get('categorie')
  return (
    <BudgetForm
      choices={choices}
      initialCategoryId={wanted && choices.some((c) => c.id === wanted) ? wanted : choices[0].id}
      onClose={close}
      onSubmit={({ categoryId, amount }) => {
        createDoc(uid, 'budgets', { amount }, categoryId)
        // Fixé depuis la première ouverture : l'Accueil doit montrer ce budget, pas la bienvenue.
        if (!user?.onboardingDone) setUserFields(uid, { onboardingDone: true })
        const name = categories.find((c) => c.id === categoryId)?.name ?? ''
        navigate('/budgets', { replace: true })
        show({
          message: `Budget fixé : ${name}, ${formatDA(amount)} par mois`,
          undo: () => removeDoc(uid, 'budgets', categoryId),
        })
      }}
    />
  )
}

export function EditBudget() {
  const { categoryId = '' } = useParams()
  const uid = useUid()
  const { categories, budgets, ready } = useData()
  const { show, dismiss } = useToast()
  const navigate = useNavigate()
  const close = useClose()
  const [confirming, setConfirming] = useState(false)
  useEffect(() => dismiss(), [dismiss])
  if (!ready) return null
  const category = categories.find((c) => c.id === categoryId)
  const budget = budgets.find((b) => b.id === categoryId)
  if (!category || !budget) {
    return <p className="muted">Ce budget n'existe plus. <Link to="/budgets">Voir les budgets</Link></p>
  }
  const previous = budget.amount

  return (
    <>
      <BudgetForm
        choices={[]}
        fixedCategory={category}
        initialAmount={previous}
        onClose={close}
        onSubmit={({ amount }) => {
          updateDocFields(uid, 'budgets', categoryId, { amount })
          navigate(`/budgets/${categoryId}`, { replace: true })
          show({
            message: `Budget modifié : ${category.name}, ${formatDA(amount)} par mois`,
            undo: () => updateDocFields(uid, 'budgets', categoryId, { amount: previous }),
          })
        }}
        onRemove={() => setConfirming(true)}
      />
      {confirming && (
        <ConfirmDialog
          title={`Retirer le budget ${category.name} ?`}
          message="Ses dépenses passeront en Hors budget. Vous pourrez annuler juste après."
          confirmLabel="Retirer"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            removeDoc(uid, 'budgets', categoryId)
            navigate('/budgets', { replace: true })
            show({
              message: `Budget retiré : ${category.name}`,
              undo: () => createDoc(uid, 'budgets', { amount: previous }, categoryId),
            })
          }}
        />
      )}
    </>
  )
}
