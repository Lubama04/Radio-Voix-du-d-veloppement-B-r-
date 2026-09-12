import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { VerificationResult } from '@/types/database'

export function useVerification(token: string) {
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!token || token.length < 8) {
      setResult({
        authentifie: false, statut: 'invalide',
        message: 'Ce document ne peut pas être authentifié.'
      })
      setLoading(false)
      return
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-pass', {
          body: { token }
        })
        if (error) throw error
        setResult(data as VerificationResult)
      } catch {
        setError(true)
        setResult({
          authentifie: false, statut: 'invalide',
          message: 'Ce document ne peut pas être authentifié.'
        })
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [token])

  return { result, loading, error }
}
