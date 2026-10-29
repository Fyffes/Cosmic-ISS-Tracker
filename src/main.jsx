import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const el = document.getElementById('root');

if (!el)
  throw new Error(
    "The 'root' element was not found. Please check your index.html file."
  );

const app = (
  <div className="min-h-screen w-full bg-[#020617] flex flex-col overflow-x-hidden font-space-meatball">
    <App />
  </div>
);

createRoot(el).render(<React.StrictMode>{app}</React.StrictMode>);
