
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import "@fontsource/darker-grotesque/400.css";
import "@fontsource/darker-grotesque/600.css";
import "@fontsource/darker-grotesque/700.css";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

