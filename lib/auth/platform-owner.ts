import { createSupabaseServerClient } from '../supabase/server';

/** Never derive authorization from email, user_metadata, or a client-provided ID. */
export async function getVerifiedPlatformOwner() {
  const client = await createSupabaseServerClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  // Platform owner assignment is provisioned by a trusted backend migration,
  // never via public signup or editable user_metadata.
  const { data, error: permissionError } = await client.from('platform_owners').select('user_id').eq('user_id',user.id).maybeSingle();
  if (permissionError || !data) return null;
  return { user, client };
}
