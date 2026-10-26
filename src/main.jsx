import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("The 'root' element was not found. Please check your index.html file.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* APP */}
    <div className="min-h-screen w-full bg-[#020617] flex flex-col overflow-x-hidden font-space-meatball">
      <App />
    </div>
  </React.StrictMode>
);