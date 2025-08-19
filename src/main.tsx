import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Add global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error('Global error:', { msg, url, lineNo, columnNo, error });
  return false;
};

// Add unhandled promise rejection handler
window.onunhandledrejection = function(event) {
  console.error('Unhandled promise rejection:', event.reason);
};

// Debug log when the script starts
console.log('Main script starting...');

const root = document.getElementById('root');
if (!root) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
