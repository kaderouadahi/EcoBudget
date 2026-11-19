/** Écran provisoire, remplacé par les specs H1 à H9. */
export function Placeholder({ title }: { title: string }) {
  return (
    <section>
      <h1>{title}</h1>
      <p style={{ color: 'var(--muted)' }}>Bientôt disponible.</p>
    </section>
  )
}
