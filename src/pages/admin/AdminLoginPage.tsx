import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function AdminLoginPage() {
  useDocumentTitle('Administration — Connexion | Radio Voix de Béré')
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) { setError(error); return }
    navigate({ to: '/admin/laissez-passer' })
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-ivory)' }}>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm"
        style={{ border: '1px solid var(--color-border)' }}>
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ background: 'var(--color-brand-light)' }}>
            <Lock className="w-6 h-6" style={{ color: 'var(--color-brand-primary)' }} />
          </div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--color-brand-primary)' }}>Administration</h1>
          <p className="text-xs text-gray-500 mt-1">Accès réservé au personnel autorisé</p>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</div>
        )}

        <label htmlFor="admin-email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
        <input id="admin-email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border text-sm mb-4"
          style={{ borderColor: 'var(--color-border)' }} autoComplete="username" />

        <label htmlFor="admin-password" className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
        <input id="admin-password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border text-sm mb-6"
          style={{ borderColor: 'var(--color-border)' }} autoComplete="current-password" />

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </main>
  )
}
