import { Navigate, Route, Routes } from 'react-router-dom'
import { EditExpense } from './features/expenses/EditExpense'
import { NewExpense } from './features/expenses/NewExpense'
import { BudgetDetail, BudgetsPage, EditBudget, SetBudget } from './features/budgets/BudgetPages'
import { AddSavings, EditGoal, GoalsPage, NewGoal } from './features/goals/GoalPages'
import { ChartsPage } from './features/charts/ChartsPage'
import { DemoPage } from './features/demo/DemoPage'
import { Home } from './features/home/Home'
import { SettingsPage } from './features/settings/SettingsPage'
import { Placeholder } from './pages/Placeholder'
import { AppShell, BareLayout } from './ui/AppShell'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="budgets" element={<BudgetsPage />} />
        <Route path="budgets/fixer" element={<SetBudget />} />
        <Route path="budgets/:categoryId" element={<BudgetDetail />} />
        <Route path="budgets/:categoryId/modifier" element={<EditBudget />} />
        <Route path="graphiques" element={<ChartsPage />} />
        <Route path="objectifs" element={<GoalsPage />} />
        <Route path="objectifs/nouveau" element={<NewGoal />} />
        <Route path="objectifs/:id" element={<EditGoal />} />
        <Route path="objectifs/:id/epargne" element={<AddSavings />} />
        <Route path="reglages" element={<SettingsPage />} />
        <Route path="demo" element={<DemoPage />} />
        <Route path="depense/nouvelle" element={<NewExpense />} />
        <Route path="depense/:id" element={<EditExpense />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="compte" element={<BareLayout />}>
        <Route path="creer" element={<Placeholder title="Créer un compte" />} />
        <Route path="connexion" element={<Placeholder title="Se connecter" />} />
      </Route>
    </Routes>
  )
}
