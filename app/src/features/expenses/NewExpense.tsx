import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUid } from '../../auth/AuthGate'
import { useData } from '../../data/DataProvider'
import { createDoc, removeDoc, setUserFields } from '../../data/repo'
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
