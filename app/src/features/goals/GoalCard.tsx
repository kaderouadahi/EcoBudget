import { CalendarClock, CircleCheck, Plus, Target, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Goal } from '../../data/model'
import { formatDA } from '../../lib/format'
import { milestone, monthLabel, type GoalStatus } from '../../lib/goals'
import './goals.css'

/** Carte d'un Objectif d'épargne : progression en bleu (jamais les couleurs des budgets), états avec icône + texte (C7). */
export function GoalCard({ goal, saved, percent, status }: { goal: Goal; saved: number; percent: number; status: GoalStatus }) {
  const step = status === 'reached' ? null : milestone(percent)
  return (
    <article className={`goal-card${status === 'reached' ? ' is-reached' : ''}`} aria-label={goal.name}>
      <Link to={`/objectifs/${goal.id}`} className="goal-card-head" aria-label={`Modifier l’objectif ${goal.name}`}>
        <span className="round-icon goal-icon"><Target aria-hidden size={24} /></span>
        <span className="goal-card-titles">
          <strong>{goal.name}</strong>
          <span className="muted">Objectif visé : {monthLabel(goal.targetMonth)}</span>
        </span>
        <span className="goal-percent" aria-hidden>{percent} %</span>
      </Link>
      <div
        className="goal-bar"
        role="progressbar"
        aria-label={`Progression de ${goal.name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent} %`}
      >
        <div style={{ width: `${percent}%` }} />
      </div>
      <p className="muted goal-amounts">{formatDA(saved)} épargnés sur {formatDA(goal.target)}</p>

      {status === 'reached' && (
        <p className="goal-banner"><CircleCheck aria-hidden size={20} />Objectif atteint !</p>
      )}
      {step && (
        <p className="goal-banner"><Trophy aria-hidden size={20} />Étape franchie : vous avez passé les {step} % !</p>
      )}
      {status === 'late' && (
        <p className="goal-late">
          <CalendarClock aria-hidden size={20} />
          <span>Date visée passée</span>
          <Link to={`/objectifs/${goal.id}`}>Modifier la date</Link>
        </p>
      )}
      {status !== 'reached' && (
        <Link to={`/objectifs/${goal.id}/epargne`} className="goal-add" aria-label={`Ajouter de l’épargne à ${goal.name}`}>
          <Plus aria-hidden size={20} />
          Ajouter de l'épargne
        </Link>
      )}
    </article>
  )
}
