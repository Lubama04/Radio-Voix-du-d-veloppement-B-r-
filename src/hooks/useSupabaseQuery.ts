import { useState, useEffect, useCallback } from 'react'

interface QueryState<T> {
  data:    T | null
  loading: boolean
  error:   string | null
}

export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: unknown }>,
  deps: unknown[] = []
): QueryState<T> & { refetch: () => void } {
  const [state, setState] = useState<QueryState<T>>({ data: null, loading: true, error: null })

  const fetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const { data, error } = await queryFn()
      if (error) throw error
      setState({ data, loading: false, error: null })
    } catch (err) {
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Erreur inconnue' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { fetch() }, [fetch])
  return { ...state, refetch: fetch }
}
