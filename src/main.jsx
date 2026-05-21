import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'

import { LanguageProvider } from './context/LanguageContext';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "970773911619-d00i5k5ga414khpvp5rcbis9lvt4jjj3.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
