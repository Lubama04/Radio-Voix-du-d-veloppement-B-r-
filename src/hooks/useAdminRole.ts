import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type AdminRole = 'super_admin' | 'admin' | 'editeur' | null

export function useAdminRole() {
  const [role, setRole] = useState<AdminRole>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('admin_users')
        .select('role, actif')
        .eq('id', user.id)
        .single()

      setRole(data?.actif ? data.role : null)
      setLoading(false)
    }
    getRole()
  }, [])

  return {
    role,
    loading,
    isSuperAdmin: role === 'super_admin',
    isAdmin: role === 'super_admin' || role === 'admin',
    isEditeur: role !== null,
  }
}
