import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AlertTriangle, Mail, FileEdit, CalendarClock, Newspaper, IdCard, Headphones, Image as ImageIcon } from 'lucide-react'
import { db } from '@/lib/supabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { AuditLogEntry } from '@/types/database'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `il y a ${h} h`
  return `il y a ${Math.floor(h / 24)} j`
}

export default function AdminDashboard() {
  useDocumentTitle('Tableau de bord | Administration')
  const [alerts, setAlerts] = useState({ expirantLP: 0, agendaAValider: 0, messagesNonLus: 0, brouillons: 0 })
  const [stats, setStats] = useState({ articlesPublies: 0, lpActifs: 0, lpExpires: 0, lpRevoques: 0, podcasts: 0, photos: 0 })
  const [activite, setActivite] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [
        expirantLP, agendaAValider, messagesNonLus, brouillons,
        articlesPublies, lpActifs, lpExpires, lpRevoques, podcasts, photos,
        recentLog,
      ] = await Promise.all([
        db.laissezPasser().select('id', { count: 'exact', head: true })
          .eq('statut', 'valide').lte('date_expiration', new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)),
        db.agenda().select('id', { count: 'exact', head: true }).eq('valide', false).eq('publie', false),
        db.contacts().select('id', { count: 'exact', head: true }).eq('repondu', false),
        db.actualites().select('id', { count: 'exact', head: true }).eq('publie', false),
        db.actualites().select('id', { count: 'exact', head: true }).eq('publie', true),
        db.laissezPasser().select('id', { count: 'exact', head: true }).eq('statut', 'valide'),
        db.laissezPasser().select('id', { count: 'exact', head: true }).eq('statut', 'expire'),
        db.laissezPasser().select('id', { count: 'exact', head: true }).eq('statut', 'revoque'),
        db.podcasts().select('id', { count: 'exact', head: true }),
        db.galerie().select('id', { count: 'exact', head: true }),
        db.auditLog().select('*').order('created_at', { ascending: false }).limit(10),
      ])

      setAlerts({
        expirantLP: expirantLP.count ?? 0,
        agendaAValider: agendaAValider.count ?? 0,
        messagesNonLus: messagesNonLus.count ?? 0,
        brouillons: brouillons.count ?? 0,
      })
      setStats({
        articlesPublies: articlesPublies.count ?? 0,
        lpActifs: lpActifs.count ?? 0,
        lpExpires: lpExpires.count ?? 0,
        lpRevoques: lpRevoques.count ?? 0,
        podcasts: podcasts.count ?? 0,
        photos: photos.count ?? 0,
      })
      setActivite((recentLog.data as AuditLogEntry[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const alertCards = [
    { n: alerts.expirantLP, label: 'Laissez-passer expirant sous 30 jours', color: '#F59E0B', bg: '#FEF3C7', to: '/admin/laissez-passer' },
    { n: alerts.agendaAValider, label: 'Événements à valider', color: '#DC2626', bg: '#FEE2E2', to: '/admin/agenda' },
    { n: alerts.messagesNonLus, label: 'Messages non lus', color: '#DC2626', bg: '#FEE2E2', to: '/admin/messages' },
    { n: alerts.brouillons, label: 'Articles en brouillon', color: '#6B7280', bg: '#F3F4F6', to: '/admin/actualites' },
  ]

  const statCards = [
    { label: 'Articles publiés', value: stats.articlesPublies, icon: Newspaper },
    { label: 'Laissez-passer actifs', value: stats.lpActifs, icon: IdCard },
    { label: 'Laissez-passer expirés', value: stats.lpExpires, icon: IdCard },
    { label: 'Laissez-passer révoqués', value: stats.lpRevoques, icon: IdCard },
    { label: 'Podcasts', value: stats.podcasts, icon: Headphones },
    { label: 'Photos en galerie', value: stats.photos, icon: ImageIcon },
  ]

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--color-brand-primary)' }}>
        Tableau de bord
      </h1>

      {/* Alertes */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {alertCards.map(a => (
          <Link key={a.label} to={a.to} className="bg-white rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
            style={{ border: '1px solid var(--color-border)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg"
              style={{ background: a.bg, color: a.color }}>
              {loading ? '…' : a.n}
            </div>
            <div className="text-xs text-gray-600 font-medium leading-tight">{a.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Statistiques */}
        <div className="lg:col-span-2">
          <h2 className="font-display font-bold text-lg mb-3" style={{ color: 'var(--color-brand-primary)' }}>Statistiques</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {statCards.map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-4" style={{ border: '1px solid var(--color-border)' }}>
                <s.icon className="w-5 h-5 mb-2" style={{ color: 'var(--color-brand-primary)' }} />
                <div className="text-2xl font-bold text-gray-900">{loading ? '…' : s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          <h2 className="font-display font-bold text-lg mb-3" style={{ color: 'var(--color-brand-primary)' }}>Activité récente</h2>
          <div className="bg-white rounded-2xl divide-y" style={{ border: '1px solid var(--color-border)' }}>
            {activite.length === 0 ? (
              <p className="p-6 text-sm text-gray-400 text-center">Aucune activité récente.</p>
            ) : activite.map(a => (
              <div key={a.id} className="p-4 text-sm flex items-center justify-between gap-3">
                <span className="text-gray-700">
                  <strong>{a.user_email ?? 'Utilisateur'}</strong> a effectué <em>{a.action}</em>
                  {a.table_name && <> sur <code className="text-xs">{a.table_name}</code></>}
                </span>
                <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(a.created_at)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accès rapides */}
        <div>
          <h2 className="font-display font-bold text-lg mb-3" style={{ color: 'var(--color-brand-primary)' }}>Accès rapides</h2>
          <div className="flex flex-col gap-3">
            <Link to="/admin/actualites/nouveau" className="btn-primary justify-center"><FileEdit className="w-4 h-4" /> Nouvel article</Link>
            <Link to="/admin/laissez-passer" className="btn-accent justify-center"><IdCard className="w-4 h-4" /> Nouveau laissez-passer</Link>
            <Link to="/admin/agenda" className="flex items-center justify-center gap-2 py-2.5 rounded-full border text-sm font-semibold" style={{ borderColor: 'var(--color-border)' }}>
              <CalendarClock className="w-4 h-4" /> Valider événements
            </Link>
            <Link to="/admin/messages" className="flex items-center justify-center gap-2 py-2.5 rounded-full border text-sm font-semibold" style={{ borderColor: 'var(--color-border)' }}>
              <Mail className="w-4 h-4" /> Voir les messages
            </Link>
          </div>
          {alerts.messagesNonLus + alerts.agendaAValider > 0 && (
            <div className="mt-4 p-3 rounded-xl flex items-start gap-2 text-xs" style={{ background: '#FEF3C7', color: '#92400E' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Des éléments attendent votre attention ci-dessus.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
