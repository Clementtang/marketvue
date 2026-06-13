import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { cleanupObsoleteKeys } from './utils/migration'

// Remove obsolete localStorage keys from older versions (e.g. the persisted
// grid layout, replaced by watchlist-order-derived arrangement in v1.19.0).
cleanupObsoleteKeys()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
