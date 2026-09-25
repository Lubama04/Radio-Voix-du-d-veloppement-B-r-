import { lazy, Suspense } from 'react'
import { createRootRoute, createRoute, createRouter, Outlet, useLocation } from '@tanstack/react-router'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import GlobalPlayer from '@/components/layout/GlobalPlayer'
import PWAInstallBanner from '@/components/shared/PWAInstallBanner'
import HomePage from '@/pages/HomePage'
import ActualitesPage from '@/pages/ActualitesPage'
import RadioPage from '@/pages/RadioPage'
import ProjetsPage from '@/pages/ProjetsPage'
import GaleriePage from '@/pages/GaleriePage'
import AProposPage from '@/pages/AProposPage'
import ContactPage from '@/pages/ContactPage'
import MentionsLegalesPage from '@/pages/MentionsLegalesPage'
import AgendaPage from '@/pages/AgendaPage'
import FrequencesPage from '@/pages/FrequencesPage'
import ArticlePage from '@/pages/ArticlePage'
import VerifyPage from '@/pages/VerifyPage'

// Le back-office (Tiptap/ProseMirror inclus) est chargé en différé — sans
// ça, chaque visiteur public téléchargerait tout l'admin (~680 Ko) rien
// que pour lire une page du site vitrine.
const AdminLoginPage      = lazy(() => import('@/pages/admin/AdminLoginPage'))
const AdminLayout         = lazy(() => import('@/pages/admin/AdminLayout'))
const AdminDashboard      = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminActualites     = lazy(() => import('@/pages/admin/AdminActualites'))
const AdminArticleEditor  = lazy(() => import('@/pages/admin/AdminArticleEditor'))
const AdminProgrammes     = lazy(() => import('@/pages/admin/AdminProgrammes'))
const AdminPodcasts       = lazy(() => import('@/pages/admin/AdminPodcasts'))
const AdminGalerie        = lazy(() => import('@/pages/admin/AdminGalerie'))
const AdminAgenda         = lazy(() => import('@/pages/admin/AdminAgenda'))
const AdminLaissezPasser  = lazy(() => import('@/pages/admin/AdminLaissezPasser'))
const AdminMediatheque    = lazy(() => import('@/pages/admin/AdminMediatheque'))
const AdminConfiguration  = lazy(() => import('@/pages/admin/AdminConfiguration'))
const AdminTicker         = lazy(() => import('@/pages/admin/AdminTicker'))
const AdminMessages       = lazy(() => import('@/pages/admin/AdminMessages'))
const AdminUtilisateurs   = lazy(() => import('@/pages/admin/AdminUtilisateurs'))

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F1EB' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#007A33', borderTopColor: 'transparent' }} />
    </div>
  )
}

// Le laissez-passer (vérification publique) et l'administration sont des
// surfaces autonomes — pas de header/footer/player du site public, qui
// dénaturerait leur mise en page sobre et institutionnelle.
function RootLayout() {
  const location = useLocation()
  const path = location.pathname

  const isAdmin  = path === '/admin' ||
                   path === '/admin/login' ||
                   path.startsWith('/admin/')
  const isVerify = path.startsWith('/verify/')

  if (isAdmin || isVerify) {
    return (
      <div className="min-h-screen flex flex-col">
        <Suspense fallback={<AdminFallback />}>
          <Outlet />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:font-semibold focus:shadow-lg"
        style={{ color: 'var(--color-brand-primary)' }}
      >
        Aller au contenu principal
      </a>
      <SiteHeader />
      <div id="main-content" className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
      <GlobalPlayer />
      <PWAInstallBanner />
    </div>
  )
}

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute          = createRoute({ getParentRoute: () => rootRoute, path: '/',                component: HomePage })
const actualitesRoute     = createRoute({ getParentRoute: () => rootRoute, path: '/actualites',     component: ActualitesPage })
const radioRoute          = createRoute({ getParentRoute: () => rootRoute, path: '/radio',          component: RadioPage })
const projetsRoute        = createRoute({ getParentRoute: () => rootRoute, path: '/projets',        component: ProjetsPage })
const galerieRoute        = createRoute({ getParentRoute: () => rootRoute, path: '/galerie',        component: GaleriePage })
const aproposRoute        = createRoute({ getParentRoute: () => rootRoute, path: '/apropos',        component: AProposPage })
const contactRoute        = createRoute({ getParentRoute: () => rootRoute, path: '/contact',        component: ContactPage })
const mentionsRoute       = createRoute({ getParentRoute: () => rootRoute, path: '/mentions-legales', component: MentionsLegalesPage })
const agendaRoute         = createRoute({ getParentRoute: () => rootRoute, path: '/agenda',           component: AgendaPage })
const frequencesRoute     = createRoute({ getParentRoute: () => rootRoute, path: '/frequences',       component: FrequencesPage })
const articleRoute        = createRoute({ getParentRoute: () => rootRoute, path: '/actualites/$slug', component: ArticlePage })
const verifyRoute         = createRoute({ getParentRoute: () => rootRoute, path: '/verify/$token',    component: VerifyPage })
const adminLoginRoute     = createRoute({ getParentRoute: () => rootRoute, path: '/admin/login',       component: AdminLoginPage })

// ─── Back-office — toutes les routes filles sont protégées par AdminLayout
// (redirection vers /admin/login si non authentifié) ───
const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: AdminLayout })

const adminIndexRoute        = createRoute({ getParentRoute: () => adminRoute, path: '/',                  component: AdminDashboard })
const adminActualitesRoute   = createRoute({ getParentRoute: () => adminRoute, path: '/actualites',         component: AdminActualites })
const adminActuNouveauRoute  = createRoute({ getParentRoute: () => adminRoute, path: '/actualites/nouveau', component: AdminArticleEditor })
const adminActuIdRoute       = createRoute({ getParentRoute: () => adminRoute, path: '/actualites/$id',     component: AdminArticleEditor })
const adminProgrammesRoute   = createRoute({ getParentRoute: () => adminRoute, path: '/programmes',         component: AdminProgrammes })
const adminPodcastsRoute     = createRoute({ getParentRoute: () => adminRoute, path: '/podcasts',           component: AdminPodcasts })
const adminGalerieRoute      = createRoute({ getParentRoute: () => adminRoute, path: '/galerie',            component: AdminGalerie })
const adminAgendaRoute       = createRoute({ getParentRoute: () => adminRoute, path: '/agenda',             component: AdminAgenda })
const adminLPRoute           = createRoute({ getParentRoute: () => adminRoute, path: '/laissez-passer',     component: AdminLaissezPasser })
const adminMediathequeRoute  = createRoute({ getParentRoute: () => adminRoute, path: '/mediatheque',        component: AdminMediatheque })
const adminConfigRoute       = createRoute({ getParentRoute: () => adminRoute, path: '/configuration',      component: AdminConfiguration })
const adminTickerRoute       = createRoute({ getParentRoute: () => adminRoute, path: '/ticker',             component: AdminTicker })
const adminMessagesRoute     = createRoute({ getParentRoute: () => adminRoute, path: '/messages',           component: AdminMessages })
const adminUtilisateursRoute = createRoute({ getParentRoute: () => adminRoute, path: '/utilisateurs',       component: AdminUtilisateurs })

const adminRouteWithChildren = adminRoute.addChildren([
  adminIndexRoute, adminActualitesRoute, adminActuNouveauRoute, adminActuIdRoute,
  adminProgrammesRoute, adminPodcastsRoute, adminGalerieRoute, adminAgendaRoute,
  adminLPRoute, adminMediathequeRoute, adminConfigRoute, adminTickerRoute,
  adminMessagesRoute, adminUtilisateursRoute,
])

const routeTree = rootRoute.addChildren([
  indexRoute, actualitesRoute, radioRoute, projetsRoute,
  galerieRoute, aproposRoute, contactRoute, mentionsRoute,
  agendaRoute, frequencesRoute, articleRoute,
  verifyRoute, adminLoginRoute, adminRouteWithChildren,
])

export const router = createRouter({ routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
