import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import GlobalPlayer from '@/components/layout/GlobalPlayer'
import LiveButton from '@/components/layout/LiveButton'
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

const rootRoute = createRootRoute({
  component: () => (
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
      <LiveButton />
    </div>
  ),
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

const routeTree = rootRoute.addChildren([
  indexRoute, actualitesRoute, radioRoute, projetsRoute,
  galerieRoute, aproposRoute, contactRoute, mentionsRoute,
  agendaRoute, frequencesRoute, articleRoute,
])

export const router = createRouter({ routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
