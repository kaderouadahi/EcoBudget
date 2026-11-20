import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useUid } from '../../auth/AuthGate'
import { useData } from '../../data/DataProvider'
import { createDoc, removeDoc, updateDocFields } from '../../data/repo'
import { nextOrder } from '../../lib/categories'
import { useToast } from '../../ui/Toast'
import { useClose } from '../expenses/useClose'
import { CategoryForm } from './CategoryForm'

export function NewCategory() {
  const uid = useUid()
  const { categories, ready } = useData()
  const { show, dismiss } = useToast()
  const navigate = useNavigate()
  const close = useClose()
  useEffect(() => dismiss(), [dismiss])
  if (!ready) return null
  return (
    <CategoryForm
      categories={categories}
      onClose={close}
      onSubmit={({ name, icon }) => {
        // En fin de liste, juste avant « Autres » (DECISIONS.md 20/11).
        const id = createDoc(uid, 'categories', { name, icon, order: nextOrder(categories), locked: false })
        navigate('/reglages', { replace: true })
        show({ message: `Catégorie ajoutée : ${name}`, undo: () => removeDoc(uid, 'categories', id) })
      }}
    />
  )
}

export function EditCategory() {
  const { id = '' } = useParams()
  const uid = useUid()
  const { categories, ready } = useData()
  const { show, dismiss } = useToast()
  const navigate = useNavigate()
  const close = useClose()
  useEffect(() => dismiss(), [dismiss])
  if (!ready) return null
  const category = categories.find((c) => c.id === id)
  // « Autres » n'est ni renommable ni supprimable ; catégorie disparue : retour aux Réglages.
  if (!category || category.locked) return <Navigate to="/reglages" replace />
  const previous = { name: category.name, icon: category.icon }
  return (
    <CategoryForm
      key={id}
      categories={categories}
      initial={category}
      onClose={close}
      onSubmit={({ name, icon }) => {
        updateDocFields(uid, 'categories', id, { name, icon })
        navigate('/reglages', { replace: true })
        show({ message: 'Catégorie modifiée', undo: () => updateDocFields(uid, 'categories', id, previous) })
      }}
    />
  )
}
