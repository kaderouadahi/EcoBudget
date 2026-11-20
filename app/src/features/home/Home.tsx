import { ChevronRight, CircleAlert, Plus, User, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categoryIcon } from '../../data/defaults'
import { useData } from '../../data/DataProvider'
import type { Budget, Category, Expense, UnusualAlert, UserDoc } from '../../data/model'
import { useUid } from '../../auth/AuthGate'
import { setUserFields } from '../../data/repo'
import { shownAlert } from '../../lib/settings'
import { AlertCard } from '../alert/AlertCard'
import { barRatio, budgetSummary, headline } from '../../lib/budget'
import { latestExpenses } from '../../lib/expenses'
import { formatDA, formatMonthTitle, monthName } from '../../lib/format'
import { currentMonth, daysLeftInMonth } from '../../lib/month'
import { BudgetCard } from '../budgets/BudgetCard'
import { OffBudgetList } from '../budgets/BudgetPages'
import '../budgets/budgets.css'
import { ExpenseList } from '../expenses/ExpenseList'
import './Home.css'

export function Home() {
  const uid = useUid()
  const { user, categories, expenses, budgets, ready } = useData()
  if (!ready) return null
  return (
    <HomeView
      user={user}
      categories={categories}
      expenses={expenses}
      budgets={budgets}
      today={new Date()}
      alert={shownAlert(user, expenses)}
      onDismissAlert={() => setUserFields(uid, { alert: undefined })}
    />
  )
}

export function HomeView({ user, categories, expenses, budgets, today, alert = null, onDismissAlert = () => {} }: {
  user: UserDoc | null
  categories: Category[]
  expenses: Expense[]
  budgets: Budget[]
  today: Date
  /** Alerte de dépense inhabituelle à afficher (déjà filtrée par visibleAlert). */
  alert?: UnusualAlert | null
  onDismissAlert?: () => void
}) {
  const month = currentMonth(today)
  const summary = budgetSummary(budgets, categories, expenses, month)
  const head = headline(summary, monthName(month))
  const byId = new Map(categories.map((c) => [c.id, c]))
  const days = daysLeftInMonth(today)
  const firstName = user?.firstName?.trim()
  const welcome = !user?.onboardingDone
  const latest = latestExpenses(expenses)

  return (
    <div className="home">
      <header className="home-head">
        <span className="avatar" aria-hidden>
          {firstName ? firstName.charAt(0).toUpperCase() : <User size={26} />}
        </span>
        <div>
          <h1>{firstName ? `Bonjour ${firstName}` : 'Bonjour'}</h1>
          <p className="home-month">{formatMonthTitle(currentMonth(today))}</p>
        </div>
      </header>

      {welcome && (
        <>
          <section className="welcome-card">
            <h2>Bienvenue sur EcoBudget</h2>
            <p>Notez vos dépenses en quelques secondes et voyez où part votre argent. Aucune inscription nécessaire.</p>
            <Link to="/depense/nouvelle" className="welcome-cta">
              <Plus aria-hidden size={22} />
              Noter ma première dépense
            </Link>
          </section>

          <section className="card">
            <h2 className="card-title">Vos catégories sont prêtes</h2>
            <ul className="chips">
              {categories.map((c) => {
                const Icon = categoryIcon(c.icon)
                return <li key={c.id} className="chip"><Icon aria-hidden size={18} />{c.name}</li>
              })}
            </ul>
            <p className="muted">Vous pourrez les renommer, en ajouter ou en supprimer dans les réglages.</p>
          </section>

          <Link to="/budgets" className="card link-card">
            <span className="link-card-icon"><Wallet aria-hidden size={22} /></span>
            <span className="link-card-text">
              <strong>Fixer un budget</strong>
              <span className="muted">Facultatif : vous pouvez le faire plus tard.</span>
            </span>
            <ChevronRight aria-hidden size={20} />
          </Link>

          <p className="home-signin">Déjà un compte ? <Link to="/compte/connexion">Se connecter</Link></p>
        </>
      )}

      {!welcome && (
        <div className="home-grid">
          <div className="home-col">
            <section className={`headline-card${head.tone === 'danger' ? ' is-danger' : ''}`} aria-label="Reste à dépenser">
              <p className="headline-label">
                {head.tone === 'danger' && <CircleAlert data-testid="headline-alert" aria-hidden size={20} />}
                {head.label}
              </p>
              <p className="headline-value">{formatDA(head.value)}</p>
              {summary.rows.length > 0 && (
                <>
                  <p className="headline-sub">
                    sur {formatDA(summary.totalBudget)} de budgets · {days} {days > 1 ? 'jours restants' : 'jour restant'}
                  </p>
                  <div className="headline-bar" aria-hidden>
                    <div style={{ width: `${barRatio(summary.spentInBudgets, summary.totalBudget) * 100}%` }} />
                  </div>
                </>
              )}
            </section>

            {alert && (
              <AlertCard
                alert={alert}
                categoryName={byId.get(alert.categoryId)?.name ?? 'Autres'}
                today={today}
                onDismiss={onDismissAlert}
              />
            )}

            {summary.rows.length === 0 && (
              <Link to="/budgets/fixer" className="card link-card">
                <span className="link-card-icon"><Wallet aria-hidden size={22} /></span>
                <span className="link-card-text">
                  <strong>Fixer un budget</strong>
                  <span className="muted">Facultatif : pour être prévenu avant de dépasser.</span>
                </span>
                <ChevronRight aria-hidden size={20} />
              </Link>
            )}

            <section className="home-section home-latest">
              <h2 className="section-title">Dernières dépenses</h2>
              {latest.length > 0 ? (
                <ExpenseList label="Dernières dépenses" expenses={latest} categories={categories} today={today} />
              ) : (
                <p className="muted">
                  Aucune dépense pour l'instant. <Link to="/depense/nouvelle">Noter une dépense</Link>
                </p>
              )}
            </section>
          </div>

          {(summary.rows.length > 0 || summary.offBudget.length > 0) && (
            <div className="home-col">
              {summary.rows.length > 0 && (
                <section className="home-section">
                  <div className="section-head">
                    <h2 className="section-title">Vos budgets</h2>
                    <Link to="/budgets">Tout voir</Link>
                  </div>
                  <div className="budget-list">
                    {summary.rows.map((r) => <BudgetCard key={r.categoryId} category={byId.get(r.categoryId)!} row={r} />)}
                  </div>
                </section>
              )}
              <OffBudgetList summary={summary} categories={categories} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
