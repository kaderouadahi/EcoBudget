import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useUid } from '../../auth/AuthGate'
import { useData } from '../../data/DataProvider'
import { createDoc, removeDoc, updateDocFields } from '../../data/repo'
import { formatDA } from '../../lib/format'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { useToast } from '../../ui/Toast'
import { ExpenseForm, type ExpenseValues } from './ExpenseForm'
import { useClose } from './useClose'

export function EditExpense() {
  const { id = '' } = useParams()
  const uid = useUid()
  const { categories, expenses, ready } = useData()
  const { show, dismiss } = useToast()
  // Le message de l'action précédente ne doit pas masquer « Enregistrer ».
  useEffect(() => dismiss(), [dismiss])
  const navigate = useNavigate()
  const close = useClose()
  // Ouvert depuis la liste du mois (H10) : retour sur la liste, même mois ; sinon l'Accueil (H1).
  const location = useLocation()
  const wanted = (location.state as { back?: unknown } | null)?.back
  const fromList = typeof wanted === 'string' && wanted.startsWith('/depenses')
  const back = fromList ? wanted : '/'
  // Depuis la liste, un vrai retour arrière : la liste n'est pas empilée deux fois, et le geste
  // retour (Android) mène ensuite à l'Accueil. Adresse ouverte directement : remplacement.
  const leave = () => (fromList && location.key !== 'default' ? navigate(-1) : navigate(back, { replace: true }))
  const [confirming, setConfirming] = useState(false)

  if (!ready) return null
  const expense = expenses.find((e) => e.id === id)
  if (!expense) {
    return (
      <section>
        <h1>Dépense introuvable</h1>
        <p>Cette dépense a peut-être été supprimée. <Link to="/">Retour à l'Accueil</Link></p>
      </section>
    )
  }
  const { id: _id, ...previous } = expense

  function save(v: ExpenseValues) {
    updateDocFields(uid, 'expenses', id, v)
    leave()
    show({
      message: `Dépense modifiée : ${formatDA(v.amount)}`,
      undo: () => updateDocFields(uid, 'expenses', id, { ...previous, note: previous.note }),
    })
  }

  function remove() {
    removeDoc(uid, 'expenses', id)
    setConfirming(false)
    leave()
    show({
      message: `Dépense supprimée : ${formatDA(previous.amount)}`,
      undo: () => createDoc(uid, 'expenses', previous, id),
    })
  }

  return (
    <>
      <ExpenseForm
        key={id}
        categories={categories}
        proposedId={expense.categoryId}
        initial={expense}
        today={new Date()}
        title="Modifier la dépense"
        submitLabel="Enregistrer"
        onSubmit={save}
        onDelete={() => setConfirming(true)}
        onClose={close}
        onManageCategories={() => navigate('/reglages#categories')}
      />
      {confirming && (
        <ConfirmDialog
          title={`Supprimer cette dépense de ${formatDA(previous.amount)} ?`}
          message="Vous pourrez l'annuler juste après."
          confirmLabel="Supprimer"
          onConfirm={remove}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  )
}
