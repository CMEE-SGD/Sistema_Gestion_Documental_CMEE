import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './core/router/AppRouter';
import './index.css'; // O cualquier archivo CSS que uses


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
