import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './core/router/AppRouter';
import { AlertProvider } from './shared/components/molecules/AlertModal';
import { ToastProvider } from './shared/components/molecules/Toast';
import ErrorBoundary from './shared/components/molecules/ErrorBoundary';
import './index.css';


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <AlertProvider>
      <ToastProvider>
        <ErrorBoundary pantallaCompleta>
          <AppRouter />
        </ErrorBoundary>
      </ToastProvider>
    </AlertProvider>
  </React.StrictMode>
);
