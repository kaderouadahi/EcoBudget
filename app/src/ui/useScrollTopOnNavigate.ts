import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * H11 : arriver sur un écran par un lien remet la page en haut (sinon /depenses s'ouvrait défilé comme
 * l'Accueil). Le retour arrière (POP) garde la position du navigateur ; une ancre (#categories) défile vers sa section.
 */
export function useScrollTopOnNavigate() {
  const { pathname, hash } = useLocation()
  const type = useNavigationType()
  useLayoutEffect(() => {
    if (type !== 'POP' && !hash) window.scrollTo(0, 0)
  }, [pathname, hash, type])
}
