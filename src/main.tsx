import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Store
import './modules/store/store';

// Components
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
