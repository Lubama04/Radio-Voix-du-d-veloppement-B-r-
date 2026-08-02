import { Download, CheckCircle } from 'lucide-react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export default function PWAInstallButton() {
  const { install, isInstalled, canInstall } = usePWAInstall()

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-sm
        font-semibold px-4 py-2 rounded-full"
        style={{ background: '#E8F5EE', color: '#006B3C' }}>
        <CheckCircle className="w-4 h-4" />
        Application installée
      </div>
    )
  }

  if (!canInstall) return null

  return (
    <button
      onClick={install}
      className="flex items-center gap-2 text-sm font-bold
        px-4 py-2 rounded-full text-white transition-all
        hover:opacity-90"
      style={{ background: '#006B3C' }}
      aria-label="Installer l'application"
    >
      <Download className="w-4 h-4" />
      Installer l'appli
    </button>
  )
}
