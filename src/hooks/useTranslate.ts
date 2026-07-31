import { useCallback } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'

// Cache simple pour éviter de retraduire le même texte
const cache = new Map<string, string>()

export function useTranslate() {
  const { lang } = useLang()

  const translate = useCallback(async (text: string): Promise<string> => {
    // Si langue française — texte original, pas besoin de traduire
    if (lang === 'fr' || !text) return text

    const cacheKey = `${text}__${lang}`

    // Vérifier le cache
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!
    }

    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: {
          text: text,
          source: 'fr',
          target: lang === 'ar' ? 'ar' : 'en'
        }
      })

      if (error || !data?.translatedText) {
        // Fallback : retourner le texte original si traduction échoue
        return text
      }

      // Mettre en cache
      cache.set(cacheKey, data.translatedText)
      return data.translatedText

    } catch {
      // Toujours retourner le texte original en cas d'erreur
      return text
    }
  }, [lang])

  return { translate, lang }
}
