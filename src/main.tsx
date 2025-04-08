import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { ThemeProvider } from './themes/ThemeContext'
import App from './App.tsx'
import './index.css'

// Import MirageJS for API mocking
import { startMirage } from './api/mirage/mirage.ts'

// Start Mirage server in development mode
if (import.meta.env.DEV) {
  console.log('Starting MirageJS server in development mode');
  startMirage();
}

// Debug theme setup
console.log('Initial theme state:', store.getState().theme);

// Initialize app with all required providers
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

// Log that render has been called
console.log('App rendering started');
