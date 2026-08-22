import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const rootElement = document.getElementById('root');

// Standard check to ensure the DOM root exists
if (!rootElement) {
  throw new Error("The 'root' element was not found. Please check your index.html file.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* The wrapper below ensures the app occupies the full width and minimum full height 
      of any device screen (Mobile, Tablet, Desktop). 
      'overflow-x-hidden' prevents unwanted horizontal scrolling.
    */}
    <div className="min-h-screen w-full bg-[#020617] flex flex-col overflow-x-hidden">
      <App />
    </div>
  </React.StrictMode>
);