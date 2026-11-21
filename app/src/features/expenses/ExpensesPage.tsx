import { ChevronLeft, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useData } from '../../data/DataProvider'
import { groupByDay, listMonths, monthTotal, summaryLabel } from '../../lib/expenseList'
import { formatDayHeading } from '../../lib/format'
import { monthLabel } from '../../lib/goals'
import { currentMonth } from '../../lib/month'
import { MonthPicker } from '../../ui/MonthPicker'
import '../budgets/budgets.css'
import '../home/Home.css'
import { ExpenseList } from './ExpenseList'
import './ExpenseForm.css'
import './ExpensesPage.css'

/**
 * Dépenses du mois (HANDOFF H10), ouvert par « Tout voir » sur l'Accueil : toutes les dépenses d'un
 * mois au choix, groupées par jour, chacune modifiable (C2, C5). Même sélecteur de mois que
 * Graphiques et mêmes lignes que « Dernières dépenses » (C6).
 * Le mois affiché est gardé dans l'URL (`?mois=AAAA-MM`) : après une modification, on revient dessus.
 * Sans paramètre (lien « Tout voir »), le mois en cours.
 */
export function ExpensesPage() {
  const { expenses, categories, ready } = useData()
  const [today] = useState(() => new Date())
  const [params, setParams] = useSearchParams()
  if (!ready) return null

  const M = currentMonth(today)
  const requested = params.get('mois')
  const months = listMonths(expenses, today, requested)
  const month = requested !== null && months.includes(requested) ? requested : M
  const groups = groupByDay(expenses, month)
  const { total, count } = monthTotal(expenses, month)
  const back = `/depenses?mois=${month}`

  return (
    <div className="home">
      <header className="list-head">
        <Link to="/" className="icon-button" aria-label="Retour à l'Accueil">
          <ChevronLeft aria-hidden size={24} />
        </Link>
        <h1>Dépenses</h1>
      </header>

      <MonthPicker months={months} value={month} current={M} label="Mois affiché" onChange={(m) => setParams({ mois: m }, { replace: true })} />

      {count > 0 ? (
        <>
          <p className="list-summary">{summaryLabel(total, count)}</p>
          {groups.map((g) => {
            const heading = formatDayHeading(g.date, today)
            return (
              <section key={g.date} className="home-section list-day">
                <h2 className="list-day-title">{heading}</h2>
                <ExpenseList label={heading} expenses={g.expenses} categories={categories} today={today} showDay={false} linkState={{ back }} />
              </section>
            )
          })}
        </>
      ) : (
        <div className="list-empty">
          {month === M ? (
            <>
              <p>Aucune dépense ce mois-ci</p>
              <Link to="/depense/nouvelle" className="small-button">
                <Plus aria-hidden size={18} />
                Ajouter une dépense
              </Link>
            </>
          ) : (
            <p>Aucune dépense en {monthLabel(month)}</p>
          )}
        </div>
      )}
    </div>
  )
}
