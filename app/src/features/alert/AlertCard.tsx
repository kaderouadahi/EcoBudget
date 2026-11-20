import type { UnusualAlert } from '../../data/model'
import { whySentence } from '../../lib/alert'
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
  // Chiffres figés à l'ajout (H3), nom actuel de la catégorie (H7) ; anciennes alertes : phrase gardée telle quelle.
  const { median, ratio, count, oldest } = alert
  const why = median !== undefined && ratio !== undefined && count !== undefined && oldest
    ? whySentence(categoryName, median, ratio, count, oldest, alert.date)
    : alert.why
  return (
    <InsightCard
      icon="bell"
      title={`Dépense inhabituelle en ${categoryName}`}
      subtitle={`${when}, nettement plus que d'habitude.`}
      panelSubtitle={when}
      why={why}
      manageLabel="Gérer les alertes"
      onDismiss={onDismiss}
    />
  )
}
