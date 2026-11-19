import { ChevronRight, Plus, User, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categoryIcon } from '../../data/defaults'
import { useData } from '../../data/DataProvider'
import type { Category, Expense, UserDoc } from '../../data/model'
import { latestExpenses } from '../../lib/expenses'
import { formatMonthTitle } from '../../lib/format'
import { currentMonth } from '../../lib/month'
import { ExpenseList } from '../expenses/ExpenseList'
import './Home.css'

export function Home() {
  const { user, categories, expenses, ready } = useData()
  if (!ready) return null
  return <HomeView user={user} categories={categories} expenses={expenses} today={new Date()} />
}

export function HomeView({ user, categories, expenses, today }: {
  user: UserDoc | null
  categories: Category[]
  expenses: Expense[]
  today: Date
}) {
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
        <section className="home-section">
          <h2 className="section-title">Dernières dépenses</h2>
          {latest.length > 0 ? (
            <ExpenseList label="Dernières dépenses" expenses={latest} categories={categories} today={today} />
          ) : (
            <p className="muted">
              Aucune dépense pour l'instant. <Link to="/depense/nouvelle">Noter une dépense</Link>
            </p>
          )}
        </section>
      )}
    </div>
  )
}
