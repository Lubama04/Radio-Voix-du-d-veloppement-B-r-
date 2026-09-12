import { supabase } from '@/lib/supabase'

export async function logAction(
  action: string,
  tableName?: string,
  recordId?: string,
  details?: object
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('audit_log').insert({
    user_id: user.id,
    user_email: user.email ?? null,
    action,
    table_name: tableName ?? null,
    record_id: recordId ?? null,
    details: details ? (details as never) : null,
  })
}
