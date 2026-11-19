import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/theme.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <h1>EcoBudget</h1>
  </StrictMode>,
)
