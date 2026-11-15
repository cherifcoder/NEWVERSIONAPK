import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/* ------------------------------------------------------------------
   Service Worker — permet de relire les ressources téléchargées
   quand l'appareil est hors-ligne (mode « Busuu »).
------------------------------------------------------------------- */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('[METHOD] service worker non enregistré', err)
    })
  })
}
