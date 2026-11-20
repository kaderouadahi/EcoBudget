import { Database } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUid } from '../../auth/AuthGate'
import { useData } from '../../data/DataProvider'
import { applyBatch } from '../../data/repo'
import { buildDemoData, demoOps } from '../../lib/demo'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { useToast } from '../../ui/Toast'
import '../home/Home.css'

/**
 * Page cachée /demo (H8) : remplace tout le compte par le jeu de démo, dates relatives au jour.
 * Outil de démonstration hors de l'interface : confirmation sans « Annuler » (DECISIONS.md 20/11).
 */
export function DemoPage() {
  const uid = useUid()
  const { categories, expenses, budgets, goals, contributions, ready } = useData()
  const { show } = useToast()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  if (!ready) return null

  return (
    <div className="home">
      <header>
        <h1>Données de démo</h1>
        <p className="home-month">Outil de démonstration</p>
      </header>
      <section className="card goals-empty">
        <p className="muted">
          Charge le jeu de démonstration : 4 mois de dépenses, des budgets et deux objectifs d'épargne, datés à partir
          d'aujourd'hui, pour montrer l'alerte de dépense inhabituelle et le conseil d'épargne.
        </p>
        <button type="button" className="primary-button" onClick={() => setConfirming(true)}>
          <Database aria-hidden size={22} />
          Charger les données de démo
        </button>
      </section>
      {confirming && (
        <ConfirmDialog
          title="Charger les données de démo ?"
          message="Toutes les données de ce compte seront remplacées par les données de démo."
          confirmLabel="Charger"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            applyBatch(uid, demoOps({ categories, expenses, budgets, goals, contributions }, buildDemoData(new Date())))
            navigate('/', { replace: true })
            show({ message: 'Données de démo chargées' })
          }}
        />
      )}
    </div>
  )
}
