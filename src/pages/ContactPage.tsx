import { useState } from 'react'
import { z } from 'zod'
import { Phone, Mail, MapPin, MessageCircle, Check, AlertCircle } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useConfig } from '@/hooks/useConfig'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { db } from '@/lib/supabase'
import GoogleMap from '@/components/shared/GoogleMap'

const contactSchema = z.object({
  nom: z.string().trim().min(1, 'Le nom est requis').max(200, 'Le nom est trop long'),
  telephone: z.string().trim().max(30, 'Numéro trop long').optional().or(z.literal('')),
  email: z.string().trim().max(320).email('Email invalide').optional().or(z.literal('')),
  objet: z.enum(['information', 'partenariat', 'publicite', 'programme', 'plainte', 'autre']),
  message: z.string().trim().min(1, 'Le message est requis').max(5000, 'Le message est trop long (5000 caractères max)'),
})

const OBJETS = [
  { value: 'information',  label: 'Demande d\'information' },
  { value: 'partenariat',  label: 'Proposition de partenariat' },
  { value: 'publicite',    label: 'Publicité à l\'antenne' },
  { value: 'programme',    label: 'Participation à une émission' },
  { value: 'plainte',      label: 'Plainte ou remarque' },
  { value: 'autre',        label: 'Autre' },
]

export default function ContactPage() {
  useDocumentTitle('Nous contacter | Radio Voix de Béré, Béré, Tchad')
  const { t } = useLang()
  const { config } = useConfig()
  const [form, setForm] = useState({ nom:'', telephone:'', email:'', objet:'information', message:'' })
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const parsed = contactSchema.safeParse(form)
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message
      setFieldErrors(errors)
      return
    }

    setStatus('loading')
    try {
      const { error } = await db.contacts().insert({
        nom: parsed.data.nom,
        telephone: parsed.data.telephone || undefined,
        email: parsed.data.email || undefined,
        objet: parsed.data.objet,
        message: parsed.data.message, lu: false, repondu: false,
      })
      if (error) throw error
      setStatus('success')
      setForm({ nom:'', telephone:'', email:'', objet:'information', message:'' })
    } catch {
      setStatus('error')
    }
    setTimeout(() => setStatus('idle'), 5000)
  }

  return (
    <main className="pt-16">
      {/* Hero */}
      <div className="py-12 px-4 text-center text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand-secondary))' }}>
        <h1 className="font-display font-bold text-4xl mb-2">{t.pages.contact}</h1>
        <p className="text-white/70">Écrivez-nous ou appelez-nous directement</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulaire */}
          <div>
            <h2 className="section-title text-2xl mb-2">Envoyer un message</h2>
            <div className="divider-brand" />

            {status === 'success' && (
              <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-green-800 bg-green-50 border border-green-200">
                <Check className="w-5 h-5 flex-shrink-0" />
                {t.forms.success}
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-red-800 bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {t.forms.error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-nom" className="block text-sm font-semibold text-gray-700 mb-1">{t.forms.name} *</label>
                <input id="contact-nom" name="nom" value={form.nom} onChange={handleChange} required
                  aria-invalid={!!fieldErrors.nom} aria-describedby={fieldErrors.nom ? 'contact-nom-error' : undefined}
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: fieldErrors.nom ? '#CC0000' : 'var(--color-border)' }}
                  placeholder={t.forms.namePlaceholder} />
                {fieldErrors.nom && <p id="contact-nom-error" className="text-xs text-red-600 mt-1">{fieldErrors.nom}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-telephone" className="block text-sm font-semibold text-gray-700 mb-1">{t.forms.phone}</label>
                  <input id="contact-telephone" name="telephone" value={form.telephone} onChange={handleChange} type="tel"
                    aria-invalid={!!fieldErrors.telephone} aria-describedby={fieldErrors.telephone ? 'contact-telephone-error' : undefined}
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: fieldErrors.telephone ? '#CC0000' : 'var(--color-border)' }} placeholder={t.forms.phonePlaceholder} />
                  {fieldErrors.telephone && <p id="contact-telephone-error" className="text-xs text-red-600 mt-1">{fieldErrors.telephone}</p>}
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 mb-1">{t.forms.email}</label>
                  <input id="contact-email" name="email" value={form.email} onChange={handleChange} type="email"
                    aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: fieldErrors.email ? '#CC0000' : 'var(--color-border)' }} placeholder={t.forms.emailPlaceholder} />
                  {fieldErrors.email && <p id="contact-email-error" className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="contact-objet" className="block text-sm font-semibold text-gray-700 mb-1">{t.forms.subject}</label>
                <select id="contact-objet" name="objet" value={form.objet} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: 'var(--color-border)' }}>
                  {OBJETS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-semibold text-gray-700 mb-1">{t.forms.message} *</label>
                <textarea id="contact-message" name="message" value={form.message} onChange={handleChange} required rows={5} maxLength={5000}
                  aria-invalid={!!fieldErrors.message} aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none"
                  style={{ borderColor: fieldErrors.message ? '#CC0000' : 'var(--color-border)' }}
                  placeholder={t.forms.messagePlaceholder} />
                {fieldErrors.message && <p id="contact-message-error" className="text-xs text-red-600 mt-1">{fieldErrors.message}</p>}
              </div>
              <button type="submit" disabled={status === 'loading'}
                className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60">
                {status === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : t.forms.send}
              </button>
            </form>
          </div>

          {/* Infos contact + carte */}
          <div className="space-y-6">
            <div>
              <h2 className="section-title text-2xl mb-2">Nos coordonnées</h2>
              <div className="divider-brand" />
            </div>

            <div className="bg-white rounded-2xl p-6 space-y-4" style={{ border: '1px solid var(--color-border)' }}>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-brand-primary)' }} />
                <div>
                  <div className="font-semibold text-gray-900">Adresse</div>
                  <div className="text-sm text-gray-600">Béré, Département de la Tandjilé Centre<br />Province de la Tandjilé, Tchad</div>
                </div>
              </div>
              {config.telephone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-brand-primary)' }} />
                  <div>
                    <div className="font-semibold text-gray-900">Téléphone</div>
                    <a href={`tel:${config.telephone}`} className="text-sm hover:underline" style={{ color: 'var(--color-brand-primary)' }}>
                      {config.telephone}
                    </a>
                  </div>
                </div>
              )}
              {config.whatsapp && (
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 flex-shrink-0 text-green-500" />
                  <div>
                    <div className="font-semibold text-gray-900">WhatsApp</div>
                    <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline">
                      Écrire sur WhatsApp
                    </a>
                  </div>
                </div>
              )}
              {config.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-brand-primary)' }} />
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <a href={`mailto:${config.email}`} className="text-sm hover:underline" style={{ color: 'var(--color-brand-primary)' }}>
                      {config.email}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: 'var(--color-accent)' }}>FM</div>
                <div>
                  <div className="font-semibold text-gray-900">Antenne</div>
                  <div className="text-sm text-gray-600">96.7 FM, 24h/24, 7j/7</div>
                </div>
              </div>
            </div>

            <GoogleMap height="280px" />
          </div>
        </div>
      </div>
    </main>
  )
}
