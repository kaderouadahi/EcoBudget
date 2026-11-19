import { useLocation, useNavigate } from 'react-router-dom'

/** Retour à l'écran précédent, ou à l'Accueil si on est arrivé directement sur l'URL. */
export function useClose(): () => void {
  const navigate = useNavigate()
  const location = useLocation()
  return () => (location.key !== 'default' ? navigate(-1) : navigate('/'))
}
