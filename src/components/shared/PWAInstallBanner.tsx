import { Download, X, Smartphone } from 'lucide-react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export default function PWAInstallBanner() {
  const { install, showBanner, dismissBanner,
          canInstall, isInstalled } = usePWAInstall()

  if (isInstalled || !showBanner) return null

  return (
    <>
      {/* Bannière en bas sur mobile */}
      <div
        className="fixed bottom-20 left-4 right-4 z-50
          rounded-2xl p-4 shadow-2xl sm:hidden"
        style={{
          background: '#004D2A',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center
            justify-center flex-shrink-0 bg-white/10">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">
              Installer l'application
            </p>
            <p className="text-white/70 text-xs mt-0.5">
              Accédez à la radio directement depuis
              votre écran d'accueil
            </p>
          </div>
          <button
            onClick={dismissBanner}
            className="text-white/50 hover:text-white
              flex-shrink-0 p-1"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {canInstall && (
          <button
            onClick={install}
            className="mt-3 w-full flex items-center
              justify-center gap-2 py-2.5 rounded-xl
              font-bold text-sm text-white transition-all"
            style={{ background: '#8B1A1A' }}
          >
            <Download className="w-4 h-4" />
            Installer maintenant
          </button>
        )}
        {!canInstall && (
          <p className="mt-3 text-white/60 text-xs text-center">
            Utilisez le menu de votre navigateur
            pour installer l'application
          </p>
        )}
      </div>

      {/* Bannière en haut à droite sur desktop */}
      <div
        className="fixed top-20 right-4 z-50 rounded-2xl
          p-4 shadow-2xl hidden sm:block w-80"
        style={{
          background: '#004D2A',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center
            justify-center flex-shrink-0 bg-white/10">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-sm">
              Installer l'application
            </p>
            <p className="text-white/70 text-xs mt-0.5">
              Accédez à la radio directement depuis
              votre bureau ou écran d'accueil
            </p>
          </div>
          <button
            onClick={dismissBanner}
            className="text-white/50 hover:text-white p-1"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {canInstall && (
          <button
            onClick={install}
            className="w-full flex items-center justify-center
              gap-2 py-2.5 rounded-xl font-bold text-sm
              text-white transition-all hover:opacity-90"
            style={{ background: '#8B1A1A' }}
          >
            <Download className="w-4 h-4" />
            Installer maintenant
          </button>
        )}
        {!canInstall && (
          <p className="text-white/60 text-xs text-center">
            Menu de votre navigateur → Installer l'application
          </p>
        )}
      </div>
    </>
  )
}
