import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import { AuthGate } from './auth/AuthGate'
import { DataProvider } from './data/DataProvider'
import { ToastProvider } from './ui/Toast'
import './ui/theme.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Navigation et messages au-dessus du compte : ils survivent à la connexion et à la déconnexion (H9). */}
    <BrowserRouter>
      <ToastProvider>
        <AuthGate>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthGate>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
