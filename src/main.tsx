import { createRoot } from 'react-dom/client'
import App from './App'
import './stijl.css'

// zonder StrictMode: anders wordt voorlezen in de testversie dubbel gestart en afgebroken
createRoot(document.getElementById('root')!).render(<App />)

// offline werken (alleen in de gebouwde versie)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'))
}
