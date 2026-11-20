import type { UnusualAlert } from '../../data/model'
import { formatDA, formatDay } from '../../lib/format'
import { InsightCard } from './InsightCard'

/** Carte « Dépense inhabituelle » (H3) : InsightCard avec la cloche. */
export function AlertCard({ alert, categoryName, today, onDismiss }: {
  alert: UnusualAlert
  categoryName: string
  today: Date
  onDismiss: () => void
}) {
  const when = `${formatDA(alert.amount)} · ${formatDay(alert.date, today)}`
  return (
    <InsightCard
      icon="bell"
      title={`Dépense inhabituelle en ${categoryName}`}
      subtitle={`${when}, nettement plus que d'habitude.`}
      panelSubtitle={when}
      why={alert.why}
      manageLabel="Gérer les alertes"
      onDismiss={onDismiss}
    />
  )
}
