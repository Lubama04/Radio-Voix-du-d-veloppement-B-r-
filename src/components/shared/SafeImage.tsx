import { useState } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  fallbackColor?: string
  loading?: 'lazy' | 'eager'
}

export default function SafeImage({
  src, alt, className = '', style = {},
  fallbackColor = '#E8F5EE', loading = 'lazy'
}: SafeImageProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (error) {
    return (
      <div
        className={className}
        style={{
          ...style,
          background: fallbackColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        role="img"
        aria-label={alt}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      style={{
        ...style,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
    />
  )
}
