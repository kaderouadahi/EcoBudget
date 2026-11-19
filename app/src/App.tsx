import { Navigate, Route, Routes } from 'react-router-dom'
import { EditExpense } from './features/expenses/EditExpense'
import { NewExpense } from './features/expenses/NewExpense'
import { BudgetDetail, BudgetsPage, EditBudget, SetBudget } from './features/budgets/BudgetPages'
import { Home } from './features/home/Home'
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
        <Route path="graphiques" element={<Placeholder title="Graphiques" />} />
        <Route path="objectifs" element={<Placeholder title="Objectifs d'épargne" />} />
        <Route path="reglages" element={<Placeholder title="Réglages" />} />
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
