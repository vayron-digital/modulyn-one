import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ToastProvider } from './contexts/ToastContext'
import { registerServiceWorker, addResourceHints, measurePerformance } from './utils/assetOptimization'

// Initialize performance optimizations with error handling
try {
  addResourceHints();
  measurePerformance();
  
  // Register service worker for caching and offline support
  registerServiceWorker();
} catch (error) {
  console.warn('Performance optimization initialization failed:', error);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>,
) 