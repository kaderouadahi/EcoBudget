import logoBleuNuit from '../assets/logo-bleu-nuit.svg'
import logoBlanc from '../assets/logo-blanc.svg'
import './Brand.css'

/**
 * Logo (DECISIONS.md 21/11, H12) : portefeuille à gauche du titre, de la couleur du titre —
 * blanc sur fond bleu nuit, bleu nuit sur fond clair. alt="" : le titre à côté suffit.
 */
export function BrandLogo({ tone }: { tone: 'blanc' | 'bleu-nuit' }) {
  return <img className="brand-logo" src={tone === 'blanc' ? logoBlanc : logoBleuNuit} alt="" width={32} height={32} />
}
