import { useEffect, useState, useCallback } from 'react'
import { UserPlus, Ban, X } from 'lucide-react'
import { db, supabase } from '@/lib/supabase'
import { useAdminRole } from '@/hooks/useAdminRole'
import { logAction } from '@/hooks/useAuditLog'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { AdminUser } from '@/types/database'

const ROLES: AdminUser['role'][] = ['super_admin', 'admin', 'editeur']

export default function AdminUtilisateurs() {
  useDocumentTitle('Utilisateurs | Administration')
  const { isSuperAdmin, loading: roleLoading } = useAdminRole()
  const [items, setItems] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [email, setEmail] = useState('')
  const [nom, setNom] = useState('')
  const [role, setRole] = useState<AdminUser['role']>('editeur')
  const [error, setError] = useState('')
  const [inviting, setInviting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.adminUsers().select('*').order('created_at')
    setItems((data as AdminUser[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const invite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    const { data, error: fnError } = await supabase.functions.invoke('admin-invite', {
      body: { email, nom, role },
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
    })
    setInviting(false)
    if (fnError || data?.error) {
      setError(data?.error || fnError?.message || "Échec de l'invitation.")
      return
    }
    await logAction('invite_admin', 'admin_users', undefined, { email, role })
    setShowInvite(false)
    setEmail(''); setNom(''); setRole('editeur')
    load()
  }

  const disable = async (u: AdminUser) => {
    if (!confirm(`Désactiver le compte de ${u.nom} ? (pas de suppression, réversible)`)) return
    await db.adminUsers().update({ actif: false }).eq('id', u.id)
    await logAction('disable_admin', 'admin_users', u.id, { email: u.email })
    load()
  }

  const enable = async (u: AdminUser) => {
    await db.adminUsers().update({ actif: true }).eq('id', u.id)
    await logAction('enable_admin', 'admin_users', u.id, { email: u.email })
    load()
  }

  const changeRole = async (u: AdminUser, newRole: AdminUser['role']) => {
    await db.adminUsers().update({ role: newRole }).eq('id', u.id)
    await logAction('update_admin_role', 'admin_users', u.id, { role: newRole })
    load()
  }

  if (!roleLoading && !isSuperAdmin) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid var(--color-border)' }}>
        <p className="text-gray-500">Cette page est réservée aux super administrateurs.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-brand-primary)' }}>Utilisateurs</h1>
        <button onClick={() => setShowInvite(true)} disabled={items.filter(u => u.actif).length >= 3} className="btn-primary disabled:opacity-40">
          <UserPlus className="w-4 h-4" /> Inviter un administrateur
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-4">{items.filter(u => u.actif).length} / 3 comptes actifs</p>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase" style={{ background: 'var(--color-surface-alt)' }}>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Actif</th>
              <th className="px-4 py-3">Créé le</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Chargement…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucun administrateur.</td></tr>
            ) : items.map(u => (
              <tr key={u.id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.nom}</td>
                <td className="px-4 py-3">
                  <select value={u.role} onChange={e => changeRole(u, e.target.value as AdminUser['role'])}
                    className="px-2 py-1 rounded border text-xs" style={{ borderColor: 'var(--color-border)' }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className="badge text-xs" style={u.actif ? { background: '#E8F5EE', color: '#007A33' } : { background: '#FEE2E2', color: '#991B1B' }}>
                    {u.actif ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">
                  {u.actif ? (
                    <button onClick={() => disable(u)} title="Désactiver" className="p-1.5 rounded hover:bg-red-50 text-red-600"><Ban className="w-4 h-4" /></button>
                  ) : (
                    <button onClick={() => enable(u)} className="text-xs font-semibold" style={{ color: '#007A33' }}>Réactiver</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
          <form onSubmit={invite} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold" style={{ color: 'var(--color-brand-primary)' }}>Inviter un administrateur</h3>
              <button type="button" onClick={() => setShowInvite(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
            <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
            <input required placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
            <select value={role} onChange={e => setRole(e.target.value as AdminUser['role'])}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="submit" disabled={inviting} className="btn-primary w-full justify-center disabled:opacity-60">
              {inviting ? 'Envoi…' : "Envoyer l'invitation"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
