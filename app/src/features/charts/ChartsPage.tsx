import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, Cell, LabelList, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useData } from '../../data/DataProvider'
import { BAR_OTHER, BAR_SELECTED, breakdown, CHART_COLORS, coveredMonths, monthlyTotals, shortMonth } from '../../lib/charts'
import { formatDA, formatMonthTitle, formatNumber } from '../../lib/format'
import { monthLabel } from '../../lib/goals'
import { currentMonth } from '../../lib/month'
import '../home/Home.css'
import './charts.css'

/**
 * Graphiques (H6) : statistiques des dépenses seulement — l'innovation interprète, Graphiques montre (DECISIONS.md 20/11).
 * Les SVG sont décoratifs (aria-hidden) : l'information est portée par la légende et le tableau des barres (C7).
 */
export function ChartsPage() {
  const { expenses, categories, ready } = useData()
  const [today] = useState(() => new Date())
  const M = currentMonth(today)
  const [selected, setSelected] = useState(M)
  const [filter, setFilter] = useState<string>('all')
  if (!ready) return null

  const months = coveredMonths(expenses, today)
  // Données changées (ajout, chargement de démo) : un mois qui n'est plus couvert revient au mois en cours.
  const month = months.includes(selected) ? selected : M
  const index = months.indexOf(month)
  const { total, rows } = breakdown(expenses, categories, month)
  const sorted = [...categories].sort((a, b) => a.order - b.order)
  const bars = monthlyTotals(expenses, categories, months, filter === 'all' ? null : filter)
  const isCurrent = month === M

  return (
    <div className="home">
      <header>
        <h1>Graphiques</h1>
      </header>

      <div className="charts-grid">
        <section className="card chart-card" aria-labelledby="repartition-title">
          <div className="chart-card-head">
            <h2 id="repartition-title" className="card-title">Répartition du mois</h2>
            <div className="month-picker" role="group" aria-label="Mois détaillé">
              <button type="button" className="month-arrow" aria-label="Mois précédent" disabled={index <= 0} onClick={() => setSelected(months[index - 1])}>
                <ChevronLeft aria-hidden size={22} />
              </button>
              <span className="month-picker-label" aria-live="polite">
                {formatMonthTitle(month)}
                {isCurrent && <span className="month-current">en cours</span>}
              </span>
              <button type="button" className="month-arrow" aria-label="Mois suivant" disabled={index >= months.length - 1} onClick={() => setSelected(months[index + 1])}>
                <ChevronRight aria-hidden size={22} />
              </button>
            </div>
          </div>

          {total === 0 ? (
            <div className="chart-empty">
              {isCurrent ? (
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
          ) : (
            <>
              <div className="donut">
                <div aria-hidden className="donut-svg">
                  <PieChart width={240} height={240} accessibilityLayer={false}>
                    <Pie
                      data={rows}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={78}
                      outerRadius={112}
                      paddingAngle={rows.length > 1 ? 3 : 0}
                      cornerRadius={6}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {rows.map((r, i) => <Cell key={r.categoryId} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </div>
                <p className="donut-total" data-testid="donut-total">
                  <strong>{formatNumber(total)}</strong>{' '}
                  <span>DA dépensés</span>
                </p>
              </div>
              <ul className="chart-legend" aria-label="Répartition par catégorie">
                {rows.map((r, i) => (
                  <li key={r.categoryId}>
                    <span className="legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden />
                    <span className="legend-name">{r.name}</span>
                    <span className="legend-amount">{formatDA(r.amount)}</span>
                    <span className="legend-percent">{r.percent}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="card chart-card" aria-labelledby="evolution-title">
          <div className="chart-card-head">
            <div>
              <h2 id="evolution-title" className="card-title">D'un mois à l'autre</h2>
              <p className="muted chart-unit">Montants en DA</p>
            </div>
            <label className="sr-only" htmlFor="bars-filter">Barres pour</label>
            <select id="bars-filter" className="text-input chart-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Toutes les dépenses</option>
              {sorted.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="bars" aria-hidden>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={bars} margin={{ top: 28, right: 4, bottom: 0, left: 4 }} accessibilityLayer={false}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  height={44}
                  tick={(props: { x?: number | string; y?: number | string; payload?: { value: string } }) => (
                    <MonthTick
                      x={Number(props.x)}
                      y={Number(props.y)}
                      month={props.payload?.value ?? ''}
                      selected={month}
                      current={M}
                      zero={bars.find((b) => b.month === props.payload?.value)?.total === 0}
                    />
                  )}
                />
                <YAxis hide domain={[0, 'auto']} />
                <Bar dataKey="total" radius={[10, 10, 10, 10]} maxBarSize={56} isAnimationActive={false}>
                  {bars.map((b) => <Cell key={b.month} fill={b.month === month ? BAR_SELECTED : BAR_OTHER} />)}
                  <LabelList dataKey="total" position="top" className="bar-label" fill="#161A24" formatter={(v) => (Number(v) > 0 ? formatNumber(Number(v)) : '')} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <table className="sr-only" aria-label="Montants par mois">
            <thead><tr><th>Mois</th><th>Montant</th></tr></thead>
            <tbody>
              {bars.map((b) => (
                <tr key={b.month}>
                  <td>{formatMonthTitle(b.month)}{b.month === M ? ' (en cours)' : ''}</td>
                  <td>{formatDA(b.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}

/**
 * Étiquette de mois sous une barre ; « en cours » sous le mois en cours ; le mois choisi en gras.
 * Mois à 0 : Recharts ne dessine ni barre ni étiquette, le « 0 » est donc écrit ici, sur la ligne de base.
 */
function MonthTick({ x, y, month, selected, current, zero }: { x: number; y: number; month: string; selected: string; current: string; zero: boolean }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {zero && <text textAnchor="middle" dy={-12} className="bar-label bar-zero">0</text>}
      <text textAnchor="middle" dy={14} className={month === selected ? 'tick tick-selected' : 'tick'}>{shortMonth(month)}</text>
      {month === current && <text textAnchor="middle" dy={32} className="tick tick-current">en cours</text>}
    </g>
  )
}
