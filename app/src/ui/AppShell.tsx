import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ADD_EXPENSE, NAV_ITEMS, SETTINGS_ITEM, type NavItem } from './nav'
import './AppShell.css'

function SideLink({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink to={item.to} end={item.to === '/'} className="side-link">
      <Icon aria-hidden size={22} />
      <span>{item.label}</span>
    </NavLink>
  )
}

function BottomLink({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink to={item.to} end={item.to === '/'} className="bottom-link">
      <Icon aria-hidden size={24} />
      <span>{item.label}</span>
    </NavLink>
  )
}

/**
 * Coquille commune (DECISIONS.md 17/11) : barre latérale sur ordinateur, barre du bas sur téléphone.
 * Les deux sont rendues à partir de NAV_ITEMS ; seule la CSS choisit la disposition (C6).
 */
export function AppShell() {
  const AddIcon = ADD_EXPENSE.icon
  const SettingsIcon = SETTINGS_ITEM.icon
  const [home, budgets, charts, goals] = NAV_ITEMS
  // Le formulaire Dépense s'affiche en plein écran sur téléphone, avec son propre bouton Fermer
  // (maquette telephone-03) : ni icône Réglages, ni barre du bas qui masquerait ses boutons.
  const { pathname } = useLocation()
  const onForm = pathname.startsWith('/depense') || pathname === '/budgets/fixer' || pathname.endsWith('/modifier')
  return (
    <div className="shell">
      <nav className="sidebar" aria-label="Navigation principale (ordinateur)">
        <p className="sidebar-brand">EcoBudget</p>
        <NavLink to={ADD_EXPENSE.to} className="sidebar-add">
          <AddIcon aria-hidden size={22} />
          <span>{ADD_EXPENSE.label}</span>
        </NavLink>
        <div className="sidebar-links">
          {NAV_ITEMS.map((item) => <SideLink key={item.to} item={item} />)}
        </div>
        <div className="sidebar-bottom">
          <SideLink item={SETTINGS_ITEM} />
        </div>
      </nav>

      <header className="topbar" hidden={onForm}>
        <NavLink to={SETTINGS_ITEM.to} className="topbar-settings" aria-label={SETTINGS_ITEM.label}>
          <SettingsIcon aria-hidden size={22} />
        </NavLink>
      </header>

      <main className={onForm ? 'panel panel-form' : 'panel'}>
        <Outlet />
      </main>

      <nav className="bottom-bar" aria-label="Navigation principale (téléphone)" hidden={onForm}>
        <BottomLink item={home} />
        <BottomLink item={budgets} />
        <NavLink to={ADD_EXPENSE.to} className="bottom-add" aria-label={ADD_EXPENSE.label}>
          <AddIcon aria-hidden size={30} />
        </NavLink>
        <BottomLink item={charts} />
        <BottomLink item={goals} />
      </nav>
    </div>
  )
}

/** Écrans de compte : sans barre latérale ni barre du bas (DECISIONS.md 17/11). */
export function BareLayout() {
  return (
    <main className="bare">
      <Outlet />
    </main>
  )
}
