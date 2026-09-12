import { useEffect, useState, useCallback } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { db } from '@/lib/supabase'
import { logAction } from '@/hooks/useAuditLog'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { Contact } from '@/types/database'

export default function AdminMessages() {
  useDocumentTitle('Messages | Administration')
  const [items, setItems] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Contact | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.contacts().select('*').order('created_at', { ascending: false })
    setItems((data as Contact[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const open = async (c: Contact) => {
    setSelected(c)
    if (!c.lu) {
      await db.contacts().update({ lu: true }).eq('id', c.id)
      load()
    }
  }

  const marquerRepondu = async (c: Contact) => {
    await db.contacts().update({ repondu: true }).eq('id', c.id)
    await logAction('marquer_repondu', 'contacts', c.id)
    setSelected(null)
    load()
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--color-brand-primary)' }}>Messages de contact</h1>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase" style={{ background: 'var(--color-surface-alt)' }}>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Sujet</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Chargement…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Aucun message.</td></tr>
              ) : items.map(c => (
                <tr key={c.id} onClick={() => open(c)} className="border-t cursor-pointer hover:bg-gray-50"
                  style={{ borderColor: 'var(--color-border)', fontWeight: c.lu ? 400 : 700 }}>
                  <td className="px-4 py-3">{c.nom}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.objet || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <span className="badge text-xs" style={c.repondu ? { background: '#E8F5EE', color: '#007A33' } : c.lu ? { background: '#F3F4F6', color: '#6B7280' } : { background: '#FEE2E2', color: '#991B1B' }}>
                      {c.repondu ? 'Répondu' : c.lu ? 'Lu' : 'Non lu'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold" style={{ color: 'var(--color-brand-primary)' }}>{selected.nom}</h3>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-500 mb-1">{selected.email} {selected.telephone && `· ${selected.telephone}`}</p>
            <p className="text-xs text-gray-400 mb-4">{selected.objet} — {new Date(selected.created_at).toLocaleString('fr-FR')}</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap mb-6">{selected.message}</p>
            {!selected.repondu && (
              <button onClick={() => marquerRepondu(selected)} className="btn-primary w-full justify-center">
                <CheckCircle2 className="w-4 h-4" /> Marquer comme répondu
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
