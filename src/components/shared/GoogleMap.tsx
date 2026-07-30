interface Props {
  lat?: string; lng?: string; zoom?: number; title?: string
  height?: string; className?: string
}

export default function GoogleMap({
  lat = '9.3167', lng = '16.0833', zoom = 12,
  title = 'Localisation Radio Béré — Tandjilé, Tchad',
  height = '300px', className = ''
}: Props) {
  const src = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`

  return (
    <div className={`overflow-hidden rounded-2xl ${className}`}
      style={{ border: '1px solid var(--color-border)', height }}>
      <iframe
        src={src}
        width="100%" height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
      />
    </div>
  )
}
