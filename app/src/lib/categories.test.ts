import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES } from '../data/defaults'
import type { Category } from '../data/model'
import { defaultIcon, nextOrder, PICKABLE_ICONS, validateCategoryName } from './categories'

const CATS = DEFAULT_CATEGORIES as Category[]

describe('validateCategoryName', () => {
  it('vide : message avec exemple', () => {
    expect(validateCategoryName('', CATS)).toBe('Donnez un nom à la catégorie, par exemple Enfants')
    expect(validateCategoryName('   ', CATS)).toBe('Donnez un nom à la catégorie, par exemple Enfants')
  })
  it('20 caractères au plus', () => {
    expect(validateCategoryName('a'.repeat(20), CATS)).toBeNull()
    expect(validateCategoryName('a'.repeat(21), CATS)).toBe('20 caractères au plus')
  })
  it('doublon refusé quelles que soient les majuscules et les espaces', () => {
    expect(validateCategoryName('sorties', CATS)).toBe('Cette catégorie existe déjà')
    expect(validateCategoryName('  Sorties  ', CATS)).toBe('Cette catégorie existe déjà')
    expect(validateCategoryName('AUTRES', CATS)).toBe('Cette catégorie existe déjà')
  })
  it('en modification, garder son propre nom n’est pas un doublon', () => {
    expect(validateCategoryName('Sorties', CATS, 'sorties')).toBeNull()
    expect(validateCategoryName('sorties ', CATS, 'sorties')).toBeNull()
    expect(validateCategoryName('Repas', CATS, 'sorties')).toBe('Cette catégorie existe déjà')
  })
  it('nom libre accepté', () => {
    expect(validateCategoryName('Enfants', CATS)).toBeNull()
  })
})

describe('icônes', () => {
  it('l’icône « … » d’Autres et l’ancien nom ne sont jamais proposés ; chaque icône a un nom', () => {
    const keys = PICKABLE_ICONS.map((i) => i.key)
    expect(keys).not.toContain('Ellipsis')
    expect(keys).not.toContain('UtensilsCrossed')
    expect(PICKABLE_ICONS.find((i) => i.key === 'Baby')?.label).toBe('Bébé')
    expect(PICKABLE_ICONS.find((i) => i.key === 'Gift')?.label).toBe('Cadeau')
    expect(PICKABLE_ICONS.every((i) => i.label.length > 0)).toBe(true)
  })
  it('présélection : la première icône non utilisée (Bébé avec les catégories par défaut)', () => {
    expect(defaultIcon(CATS)).toBe('Baby')
    expect(defaultIcon([...CATS, { id: 'x', name: 'Enfants', icon: 'Baby', order: 7, locked: false }])).toBe('Gift')
  })
  it('en modification : l’icône actuelle', () => {
    expect(defaultIcon(CATS, 'Ticket')).toBe('Ticket')
  })
})

describe('nextOrder', () => {
  it('fin de liste, avant Autres', () => {
    expect(nextOrder(CATS)).toBe(7)
    expect(nextOrder([...CATS, { id: 'x', name: 'Enfants', icon: 'Baby', order: 7, locked: false }])).toBe(8)
  })
})
