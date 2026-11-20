import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUid } from '../../auth/AuthGate'
import { useData } from '../../data/DataProvider'
import { createDoc, removeDoc, setUserFields } from '../../data/repo'
import { checkUnusual, whySentence } from '../../lib/alert'
import { proposedCategoryId } from '../../lib/expenses'
import { formatDA } from '../../lib/format'
import { useToast } from '../../ui/Toast'
import { ExpenseForm, type ExpenseValues } from './ExpenseForm'
import { noticeAfterAdd } from './useExpenseNotice'
import { useClose } from './useClose'

export function NewExpense() {
  const uid = useUid()
  const { categories, expenses, budgets, user, ready } = useData()
  const { show, dismiss } = useToast()
  // Le message de l'action précédente ne doit pas masquer « Enregistrer ».
  useEffect(() => dismiss(), [dismiss])
  const navigate = useNavigate()
  const close = useClose()
  if (!ready) return null

  const today = new Date()

  function save(v: ExpenseValues) {
    const id = createDoc(uid, 'expenses', { ...v, createdAt: Date.now() })
    if (!user?.onboardingDone) setUserFields(uid, { onboardingDone: true })
    const name = categories.find((c) => c.id === v.categoryId)?.name ?? 'Autres'
    // Innovation (H3) : contrôle seulement à l'ajout, sur l'appareil (fonctionne hors connexion).
    if (user?.alertsEnabled !== false) {
      const hit = checkUnusual({ id, amount: v.amount, categoryId: v.categoryId, date: v.date }, expenses)
      if (hit) {
        const oldest = hit.history.reduce((min, e) => (e.date < min ? e.date : min), hit.history[0].date)
        const why = whySentence(name, hit.median, hit.ratio, hit.history.length, oldest, v.date)
        // Une seule alerte : la nouvelle remplace l'ancienne.
        setUserFields(uid, {
          alert: {
            expenseId: id, amount: v.amount, categoryId: v.categoryId, date: v.date, why,
            median: hit.median, ratio: hit.ratio, count: hit.history.length, oldest,
          },
        })
      }
    }
    const notice = noticeAfterAdd(expenses, budgets, v, name, today)
    navigate('/', { replace: true })
    show({
      message: `Dépense ajoutée : ${formatDA(v.amount)}, ${name}${notice ? ` · ${notice.text}` : ''}`,
      tone: notice?.tone,
      undo: () => removeDoc(uid, 'expenses', id),
    })
  }

  return (
    <ExpenseForm
      categories={categories}
      proposedId={proposedCategoryId(expenses, categories)}
      today={today}
      submitLabel="Enregistrer la dépense"
      onSubmit={save}
      onClose={close}
    />
  )
}
