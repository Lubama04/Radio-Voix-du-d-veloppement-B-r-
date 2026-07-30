interface Props {
  title: string
  subtitle?: string
  action?: { label: string; href: string }
  align?: 'left' | 'center'
}

export default function SectionHeader({ title, subtitle, action, align = 'left' }: Props) {
  return (
    <div className={`mb-8 ${align === 'center' ? 'text-center' : ''}`}>
      <h2 className="section-title text-2xl sm:text-3xl">{title}</h2>
      <div className={`divider-brand ${align === 'center' ? 'mx-auto' : ''}`} />
      {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
      {action && (
        <a href={action.href}
          className="inline-flex items-center gap-1 text-sm font-semibold mt-2 hover:underline"
          style={{ color: 'var(--color-brand-primary)' }}>
          {action.label} →
        </a>
      )}
    </div>
  )
}
