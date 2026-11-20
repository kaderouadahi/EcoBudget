import { Cloud, Lock, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUid } from '../../auth/AuthGate'
import { categoryIcon } from '../../data/defaults'
import { useData } from '../../data/DataProvider'
import type { Category } from '../../data/model'
import { applyBatch, setUserFields } from '../../data/repo'
import { deleteCategoryPlan, deleteConfirmText, deleteMessage, OTHER_ID } from '../../lib/categories'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { cleanFirstName, FIRST_NAME_MAX } from '../../lib/settings'
import { useToast } from '../../ui/Toast'
import '../expenses/ExpenseForm.css'
import '../budgets/budgets.css'
import '../home/Home.css'
import './settings.css'

/** Réglages (H7) : Compte, Catégories, Alertes et conseils (DECISIONS.md 18/11 et 20/11). */
export function SettingsPage() {
  const uid = useUid()
  const { user, categories, expenses, budgets, ready } = useData()
  const [deleting, setDeleting] = useState<Category | null>(null)
  const { show } = useToast()
  const { hash } = useLocation()

  // « Gérer les alertes / les conseils » mènent directement à la section (C1).
  useEffect(() => {
    if (ready && hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [ready, hash])

  if (!ready) return null
  const sorted = [...categories].sort((a, b) => a.order - b.order)

  function toggle(field: 'alertsEnabled' | 'adviceEnabled', on: boolean) {
    setUserFields(uid, { [field]: on })
    const MESSAGES = {
      alertsEnabled: ['Alertes désactivées', 'Alertes activées'],
      adviceEnabled: ['Conseils désactivés', 'Conseils activés'],
    } as const
    show({ message: MESSAGES[field][on ? 1 : 0] })
  }

  return (
    <div className="home">
      <header>
        <h1>Réglages</h1>
      </header>

      <div className="settings-grid">
        <div className="settings-col">
          <section className="settings-section" aria-labelledby="compte-title">
            <h2 id="compte-title" className="section-title">Compte</h2>
            <div className="card settings-card">
              <div className="account-row">
                <span className="round-icon"><Cloud aria-hidden size={22} /></span>
                <div>
                  <strong>Sans compte</strong>
                  <p className="muted">Vos données sont enregistrées de façon anonyme sur cet appareil.</p>
                </div>
              </div>
              <FirstNameField
                saved={user?.firstName}
                onSave={(firstName) => {
                  setUserFields(uid, { firstName })
                  show({ message: 'Prénom enregistré' })
                }}
              />
            </div>
          </section>
        </div>

        <div className="settings-col">
          <section className="settings-section" aria-labelledby="categories-title">
            <h2 id="categories-title" className="section-title">Catégories</h2>
            <div className="card settings-card">
              <ul className="category-list" aria-label="Catégories">
                {sorted.map((c) => {
                  const Icon = categoryIcon(c.icon)
                  return (
                    <li key={c.id} className="category-row">
                      <span className="round-icon small"><Icon aria-hidden size={20} /></span>
                      <span className="category-name">{c.name}</span>
                      {c.locked ? (
                        <span className="category-locked"><Lock aria-hidden size={16} />Toujours présente</span>
                      ) : (
                        <>
                          <Link to={`/reglages/categories/${c.id}`} className="row-action" aria-label={`Modifier ${c.name}`}>
                            <Pencil aria-hidden size={19} />
                          </Link>
                          <button type="button" className="row-action is-delete" aria-label={`Supprimer ${c.name}`} onClick={() => setDeleting(c)}>
                            <Trash2 aria-hidden size={19} />
                          </button>
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
              <Link to="/reglages/categories/nouvelle" className="outline-button">
                <Plus aria-hidden size={20} />
                Ajouter une catégorie
              </Link>
            </div>
          </section>

          {deleting && (
            <DeleteCategoryDialog
              category={deleting}
              categories={sorted}
              count={expenses.filter((e) => e.categoryId === deleting.id).length}
              hasBudget={budgets.some((b) => b.id === deleting.id)}
              onCancel={() => setDeleting(null)}
              onConfirm={(targetId) => {
                const plan = deleteCategoryPlan(deleting, targetId, expenses, budgets)
                setDeleting(null)
                if (!plan) return
                applyBatch(uid, plan.ops)
                const targetName = sorted.find((c) => c.id === targetId)?.name ?? 'Autres'
                show({ message: deleteMessage(deleting.name, plan.moved, targetName), undo: () => applyBatch(uid, plan.undo) })
              }}
            />
          )}

          <section className="settings-section" id="alertes" aria-labelledby="alertes-title">
            <h2 id="alertes-title" className="section-title">Alertes et conseils</h2>
            <div className="card settings-card">
              <SwitchRow
                id="switch-alerts"
                title="Dépenses inhabituelles"
                description="Vous prévenir quand une dépense sort de vos habitudes"
                on={user?.alertsEnabled !== false}
                onChange={(on) => toggle('alertsEnabled', on)}
              />
              <SwitchRow
                id="switch-advice"
                title="Conseils d'épargne"
                description="Vous proposer comment atteindre un objectif plus tôt"
                on={user?.adviceEnabled !== false}
                onChange={(on) => toggle('adviceEnabled', on)}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

/** Confirmation de suppression (maquette telephone-09) : nombre de dépenses, catégorie cible, budget supprimé. */
function DeleteCategoryDialog({ category, categories, count, hasBudget, onCancel, onConfirm }: {
  category: Category
  categories: Category[]
  count: number
  hasBudget: boolean
  onCancel: () => void
  onConfirm: (targetId: string) => void
}) {
  const [target, setTarget] = useState(OTHER_ID)
  // « Autres » d'abord (par défaut), puis les autres catégories dans leur ordre.
  const targets = [
    ...categories.filter((c) => c.id === OTHER_ID),
    ...categories.filter((c) => c.id !== OTHER_ID && c.id !== category.id),
  ]
  const [first, ...rest] = deleteConfirmText(category.name, count, hasBudget)
  return (
    <ConfirmDialog
      title={`Supprimer la catégorie ${category.name} ?`}
      confirmLabel="Supprimer"
      onCancel={onCancel}
      onConfirm={() => onConfirm(target)}
    >
      <p>{first}</p>
      {count > 0 && (
        <div className="field dialog-field">
          <label htmlFor="move-target">Déplacer les dépenses vers</label>
          <select id="move-target" className="text-input" value={target} onChange={(e) => setTarget(e.target.value)}>
            {targets.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}
      {rest.map((line) => <p key={line}>{line}</p>)}
    </ConfirmDialog>
  )
}

/** Prénom facultatif, enregistré en quittant le champ ou avec Entrée (DECISIONS.md 20/11). */
function FirstNameField({ saved, onSave }: { saved: string | undefined; onSave: (v: string | undefined) => void }) {
  const [value, setValue] = useState(saved ?? '')
  const last = useRef(saved)
  const preview = cleanFirstName(value)

  function commit() {
    const next = cleanFirstName(value)
    setValue(next ?? '')
    if ((next ?? '') === (last.current ?? '')) return
    last.current = next
    onSave(next)
  }

  // Écran fermé sans quitter le champ (geste retour Android) : le prénom saisi est quand même enregistré.
  const commitRef = useRef(commit)
  commitRef.current = commit
  useEffect(() => () => commitRef.current(), [])

  return (
    <div className="field">
      <label htmlFor="first-name">Votre prénom (facultatif)</label>
      <input
        id="first-name"
        className="text-input"
        autoComplete="given-name"
        maxLength={FIRST_NAME_MAX}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          }
        }}
        aria-describedby="first-name-help"
      />
      <p id="first-name-help" className="field-help">
        Affiché sur l'accueil : « {preview ? `Bonjour ${preview}` : 'Bonjour'} »
      </p>
    </div>
  )
}

/** Interrupteur avec son état écrit en texte : jamais la couleur seule (C7). */
function SwitchRow({ id, title, description, on, onChange }: {
  id: string
  title: string
  description: string
  on: boolean
  onChange: (on: boolean) => void
}) {
  return (
    <div className="switch-row">
      <div className="switch-text">
        <strong id={`${id}-title`}>{title}</strong>
        <span id={`${id}-desc`} className="muted">{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
        className={`switch${on ? ' is-on' : ''}`}
        onClick={() => onChange(!on)}
      >
        <span className="switch-label">{on ? 'Activé' : 'Désactivé'}</span>
        <span className="switch-track" aria-hidden><span className="switch-thumb" /></span>
      </button>
    </div>
  )
}
