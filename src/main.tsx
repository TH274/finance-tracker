import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { ThemeProvider } from './themes/ThemeContext'
import App from './App.tsx'
import './index.css'
import { startMirage } from './api/mirage/mirage.ts'

const USE_MIRAGE = !import.meta.env.VITE_USE_JSON_SERVER;

if (import.meta.env.DEV && USE_MIRAGE) {
  console.log('Starting MirageJS server in development mode');
  startMirage();
}

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

createRoot(rootElement!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
