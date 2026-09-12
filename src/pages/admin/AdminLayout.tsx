import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  LayoutDashboard, Newspaper, Mic, Headphones, Image, CalendarDays,
  FolderOpen, IdCard, Settings, Megaphone, Mail, Users, LogOut, Menu, X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminRole } from '@/hooks/useAdminRole'
import SafeImage from '@/components/shared/SafeImage'

const NAV = [
  { section: null, items: [
    { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, superAdminOnly: false },
  ]},
  { section: 'Contenu', items: [
    { to: '/admin/actualites',  label: 'Actualités',   icon: Newspaper, superAdminOnly: false },
    { to: '/admin/programmes',  label: 'Programmes',   icon: Mic, superAdminOnly: false },
    { to: '/admin/podcasts',    label: 'Podcasts',     icon: Headphones, superAdminOnly: false },
    { to: '/admin/galerie',     label: 'Galerie',      icon: Image, superAdminOnly: false },
    { to: '/admin/agenda',      label: 'Agenda',       icon: CalendarDays, superAdminOnly: false },
    { to: '/admin/mediatheque', label: 'Médiathèque',  icon: FolderOpen, superAdminOnly: false },
  ]},
  { section: 'Administration', items: [
    { to: '/admin/laissez-passer', label: 'Laissez-passer', icon: IdCard, superAdminOnly: false },
    { to: '/admin/configuration',  label: 'Configuration',  icon: Settings, superAdminOnly: false },
    { to: '/admin/ticker',         label: 'Ticker',         icon: Megaphone, superAdminOnly: false },
    { to: '/admin/messages',       label: 'Messages',       icon: Mail, superAdminOnly: false },
    { to: '/admin/utilisateurs',   label: 'Utilisateurs',   icon: Users, superAdminOnly: true },
  ]},
] as const

const TITLES: Record<string, string> = {
  '/admin': 'Tableau de bord',
  '/admin/actualites': 'Actualités',
  '/admin/programmes': 'Programmes',
  '/admin/podcasts': 'Podcasts',
  '/admin/galerie': 'Galerie',
  '/admin/agenda': 'Agenda',
  '/admin/mediatheque': 'Médiathèque',
  '/admin/laissez-passer': 'Laissez-passer',
  '/admin/configuration': 'Configuration',
  '/admin/ticker': 'Ticker',
  '/admin/messages': 'Messages',
  '/admin/utilisateurs': 'Utilisateurs',
}

function breadcrumbFor(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname]
  if (pathname.startsWith('/admin/actualites/')) return 'Actualités › Éditeur'
  return 'Administration'
}

export default function AdminLayout() {
  const { session, loading: authLoading, signOut } = useAuth()
  const { role, isSuperAdmin, loading: roleLoading } = useAdminRole()
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !session) navigate({ to: '/admin/login' })
  }, [authLoading, session, navigate])

  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  if (authLoading || !session) return null

  const isActive = (to: string) => to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to)

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-5 py-5">
        <SafeImage src="/logo.png" alt="Radio Voix de Béré" className="rounded-full object-cover" style={{ width: 40, height: 40 }} />
        <div>
          <div className="font-display font-bold text-sm text-white leading-tight">Voix de Béré</div>
          <div className="text-xs text-white/50">96.7 FM</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map((group, gi) => (
          <div key={gi} className="mb-2">
            {group.section && (
              <div className="px-3 pt-4 pb-1 text-[0.65rem] font-bold uppercase tracking-wider text-white/40">
                {group.section}
              </div>
            )}
            {group.items.map(item => {
              if (item.superAdminOnly && !isSuperAdmin) return null
              const active = isActive(item.to)
              return (
                <Link key={item.to} to={item.to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors"
                  style={active ? { background: '#007A33', color: 'white' } : { color: 'rgba(255,255,255,0.75)' }}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-white/10">
        <button onClick={() => signOut().then(() => navigate({ to: '/admin/login' }))}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold w-full"
          style={{ color: '#FF6B6B' }}>
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex" style={{ background: '#F4F1EB' }}>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col flex-shrink-0" style={{ width: 240, background: '#1E2A22' }}>
        {sidebarContent}
      </aside>

      {/* Sidebar mobile (drawer) */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setDrawerOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden" style={{ width: 240, background: '#1E2A22' }}>
            {sidebarContent}
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 flex-shrink-0"
          style={{ background: '#FDFCF9', borderBottom: '1px solid #E8E4DC' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawerOpen(o => !o)} className="lg:hidden p-1.5 text-gray-500">
              {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="text-sm text-gray-500">
              <span className="text-gray-400">Admin</span> <span className="mx-1">›</span>
              <span className="font-semibold text-gray-800">{breadcrumbFor(location.pathname)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!roleLoading && (
              <span className="hidden sm:inline text-sm text-gray-600">{session.user.email}</span>
            )}
            <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white uppercase tracking-wide"
              style={{ background: '#007A33' }}>
              {role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : role ? 'Éditeur' : 'Admin'}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
