// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // Ensure this is a named import
import './styles/global.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* This is the crucial part. AuthProvider must wrap App. */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

