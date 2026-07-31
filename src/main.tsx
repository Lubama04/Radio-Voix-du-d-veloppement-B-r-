import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { PlayerProvider } from '@/contexts/PlayerContext'
import { router } from '@/router'
import '@/styles/globals.css'

// Le service worker est injecté et enregistré automatiquement par vite-plugin-pwa (registerType: autoUpdate)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <PlayerProvider>
        <RouterProvider router={router} />
        <Analytics />
      </PlayerProvider>
    </LanguageProvider>
  </StrictMode>
)
