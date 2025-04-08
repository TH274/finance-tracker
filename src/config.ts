const USE_JSON_SERVER = import.meta.env.VITE_USE_JSON_SERVER === 'true';

export const apiBaseUrl = import.meta.env.DEV 
  ? (USE_JSON_SERVER ? 'http://localhost:3001' : '/api')
  : 'http://localhost:3001';


export const themeOptions = {
  light: {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b', 
    danger: '#ef4444',
  },
  dark: {
    primary: '#60a5fa', 
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
  }
};

export const defaultPageLimit = 10; 