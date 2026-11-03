import { createRoot } from 'react-dom/client'
import App from './App'
// Andika: lettertype gemaakt voor leren lezen (o.a. een 'a' en 'g' zoals op school)
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-700.css'
// Nunito: rond en vriendelijk lettertype voor titels en knoppen
import '@fontsource/nunito/latin-600.css'
import '@fontsource/nunito/latin-700.css'
import '@fontsource/nunito/latin-800.css'
import '@fontsource/nunito/latin-900.css'
import './stijl.css'

// zonder StrictMode: anders wordt voorlezen in de testversie dubbel gestart en afgebroken
createRoot(document.getElementById('root')!).render(<App />)

// offline werken (alleen in de gebouwde versie)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'))
}
