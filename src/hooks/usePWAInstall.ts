import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      setShowBanner(false)
      localStorage.setItem('pwa-installed', 'true')
    })

    const alreadyInstalled =
      localStorage.getItem('pwa-installed') === 'true'
    if (!alreadyInstalled) {
      const timer = setTimeout(() => setShowBanner(true), 3000)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handler)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setShowBanner(false)
      localStorage.setItem('pwa-installed', 'true')
    }
    setInstallPrompt(null)
  }

  const dismissBanner = () => {
    setShowBanner(false)
    setTimeout(() => {
      if (!isInstalled) setShowBanner(true)
    }, 5 * 60 * 1000)
  }

  return { install, isInstalled, showBanner,
           dismissBanner, canInstall: !!installPrompt }
}
