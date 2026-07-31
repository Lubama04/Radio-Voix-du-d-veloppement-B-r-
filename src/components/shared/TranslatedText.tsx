import { useState, useEffect } from 'react'
import { useTranslate } from '@/hooks/useTranslate'

interface Props {
  text: string
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'div'
  className?: string
  style?: React.CSSProperties
}

export default function TranslatedText({
  text, as: Tag = 'span', className, style
}: Props) {
  const { translate, lang } = useTranslate()
  const [translated, setTranslated] = useState(text)

  useEffect(() => {
    let cancelled = false
    translate(text).then(result => {
      if (!cancelled) setTranslated(result)
    })
    return () => { cancelled = true }
  }, [text, lang, translate])

  return <Tag className={className} style={style}>{translated}</Tag>
}
