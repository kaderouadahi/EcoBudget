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
    <AuthGate>
      <DataProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </DataProvider>
    </AuthGate>
  </StrictMode>,
)
