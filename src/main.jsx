import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'

import { LanguageProvider } from './context/LanguageContext';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "758038044042-hik4uqmbc4d96sq7tkojl9q32smnursc.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
