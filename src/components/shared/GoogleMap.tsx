interface Props {
  lat?: string; lng?: string; zoom?: number; title?: string
  height?: string; className?: string
}

export default function GoogleMap({
  zoom = 13,
  title = 'Localisation Radio Voix de Béré, Béré, Tandjilé, Tchad',
  height = '300px', className = ''
}: Props) {
  const src = `https://maps.google.com/maps?q=Béré,Tandjilé,Tchad&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`

  return (
    <div className={`overflow-hidden rounded-2xl ${className}`}
      style={{ border: '1px solid var(--color-border)', height, background: '#f0f0f0' }}>
      <iframe
        src={src}
        width="100%" height="100%"
        style={{ border: 0, display: 'block' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
      />
    </div>
  )
}
