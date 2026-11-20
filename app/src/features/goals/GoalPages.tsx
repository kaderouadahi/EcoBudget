import { Plus } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useUid } from '../../auth/AuthGate'
import { useData } from '../../data/DataProvider'
import { createDoc, removeDoc, setUserFields, updateDocFields } from '../../data/repo'
import { adviceText, adviceWhy, computeAdvice } from '../../lib/advice'
import { InsightCard } from '../alert/InsightCard'
import { formatDA } from '../../lib/format'
import { correction, editNotice, goalPercent, goalStatus, progressNotice, savedAmount, sortGoals } from '../../lib/goals'
import { currentMonth, toISODate } from '../../lib/month'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { useToast } from '../../ui/Toast'
import { useClose } from '../expenses/useClose'
import '../home/Home.css'
import { GoalCard } from './GoalCard'
import { GoalForm } from './GoalForm'
import { SavingsForm } from './SavingsForm'

export function GoalsPage() {
  const uid = useUid()
  const { goals, contributions, expenses, categories, user, ready } = useData()
  if (!ready) return null
  const today = new Date()
  const month = currentMonth(today)
  // Innovation (H5) : conseil recalculé à chaque ouverture, sur le dernier mois complet.
  const advice = computeAdvice({ goals, contributions, expenses, categories, user, today })
  const items = sortGoals(goals.map((goal) => {
    const saved = savedAmount(goal.id, contributions)
    return { goal, saved, percent: goalPercent(saved, goal.target), status: goalStatus(saved, goal.target, goal.targetMonth, month) }
  }))
  return (
    <div className="home">
      <header className="goals-head">
        <div>
          <h1>Objectifs</h1>
          <p className="home-month">Votre épargne</p>
        </div>
        {items.length > 0 && (
          <Link to="/objectifs/nouveau" className="small-button">
            <Plus aria-hidden size={18} />
            Nouvel objectif
          </Link>
        )}
      </header>
      {items.length === 0 ? (
        <section className="card goals-empty">
          <p className="card-title">Pas encore d'objectif d'épargne</p>
          <p className="muted">Un objectif se crée en trois champs : un nom, un montant, une date visée.</p>
          <Link to="/objectifs/nouveau" className="primary-button">
            <Plus aria-hidden size={22} />
            Créer un objectif
          </Link>
        </section>
      ) : (
        <div className="goal-list">
          {items.map((i) => (
            <Fragment key={i.goal.id}>
              <GoalCard goal={i.goal} saved={i.saved} percent={i.percent} status={i.status} />
              {advice?.goalId === i.goal.id && (
                <InsightCard
                  icon="bulb"
                  title="Conseil"
                  subtitle={adviceText(advice)}
                  why={adviceWhy(advice)}
                  manageLabel="Gérer les conseils"
                  onDismiss={() => setUserFields(uid, { adviceHiddenUntil: month })}
                />
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

export function NewGoal() {
  const uid = useUid()
  const { show, dismiss } = useToast()
  const navigate = useNavigate()
  const close = useClose()
  useEffect(() => dismiss(), [dismiss])
  return (
    <GoalForm
      today={new Date()}
      onClose={close}
      onSubmit={({ name, target, targetMonth }) => {
        const id = createDoc(uid, 'goals', { name, target, targetMonth, createdAt: Date.now() })
        navigate('/objectifs', { replace: true })
        show({ message: `Objectif créé : ${name}`, undo: () => removeDoc(uid, 'goals', id) })
      }}
    />
  )
}

export function EditGoal() {
  const { id = '' } = useParams()
  const uid = useUid()
  const { goals, contributions, ready } = useData()
  const { show, dismiss } = useToast()
  const navigate = useNavigate()
  const close = useClose()
  const [confirming, setConfirming] = useState(false)
  useEffect(() => dismiss(), [dismiss])
  if (!ready) return null
  const goal = goals.find((g) => g.id === id)
  if (!goal) return <Navigate to="/objectifs" replace />
  const { id: _id, ...previous } = goal
  const own = contributions.filter((c) => c.goalId === id)
  const saved = savedAmount(id, contributions)
  const today = new Date()

  return (
    <>
      <GoalForm
        key={id}
        initial={goal}
        initialSaved={saved}
        today={today}
        onClose={close}
        onDelete={() => setConfirming(true)}
        onSubmit={({ name, target, targetMonth, saved: newSaved = saved }) => {
          updateDocFields(uid, 'goals', id, { name, target, targetMonth })
          const diff = correction(saved, newSaved)
          // Montant épargné corrigé : versement de correction daté du jour (DECISIONS.md 19/11).
          const corrId = diff !== 0
            ? createDoc(uid, 'contributions', { goalId: id, amount: diff, date: toISODate(today), createdAt: Date.now() })
            : null
          const state = editNotice(saved, previous.target, newSaved, target)
          navigate('/objectifs', { replace: true })
          show({
            message: `Objectif modifié${state}`,
            undo: () => {
              updateDocFields(uid, 'goals', id, { name: previous.name, target: previous.target, targetMonth: previous.targetMonth })
              if (corrId) removeDoc(uid, 'contributions', corrId)
            },
          })
        }}
      />
      {confirming && (
        <ConfirmDialog
          title={`Supprimer l'objectif « ${goal.name} » ?`}
          message={`Son suivi (${formatDA(saved)} épargnés) sera effacé. Vous pourrez annuler juste après.`}
          confirmLabel="Supprimer"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            removeDoc(uid, 'goals', id)
            own.forEach((c) => removeDoc(uid, 'contributions', c.id))
            navigate('/objectifs', { replace: true })
            show({
              message: `Objectif supprimé : ${goal.name}`,
              undo: () => {
                createDoc(uid, 'goals', previous, id)
                own.forEach(({ id: cid, ...c }) => createDoc(uid, 'contributions', c, cid))
              },
            })
          }}
        />
      )}
    </>
  )
}

export function AddSavings() {
  const { id = '' } = useParams()
  const uid = useUid()
  const { goals, contributions, ready } = useData()
  const { show, dismiss } = useToast()
  const navigate = useNavigate()
  const close = useClose()
  useEffect(() => dismiss(), [dismiss])
  if (!ready) return null
  const goal = goals.find((g) => g.id === id)
  if (!goal) return <Navigate to="/objectifs" replace />
  const saved = savedAmount(id, contributions)

  return (
    <SavingsForm
      goalName={goal.name}
      remaining={goal.target - saved}
      today={new Date()}
      onClose={close}
      onSubmit={({ amount, date }) => {
        const cid = createDoc(uid, 'contributions', { goalId: id, amount, date, createdAt: Date.now() })
        const notice = progressNotice(saved, saved + amount, goal.target)
        navigate('/objectifs', { replace: true })
        show({
          message: `${formatDA(amount)} ajoutés à « ${goal.name} »${notice ? ` · ${notice}` : ''}`,
          undo: () => removeDoc(uid, 'contributions', cid),
        })
      }}
    />
  )
}
