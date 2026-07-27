import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FDCProvider } from './context/FDCContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FDCProvider>
      <App />
    </FDCProvider>
  </StrictMode>,
)
