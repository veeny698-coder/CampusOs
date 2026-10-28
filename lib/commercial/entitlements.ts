import 'server-only';
import { createSupabaseServerClient } from '../supabase/server';

/**
 * Server-only entitlement decision. The database independently verifies the
 * caller's platform-owner or active institution membership scope; callers
 * must still authorize their domain action before using a true result.
 */
export async function checkCommercialEntitlement(institutionId: string, entitlementKey: string, requestedQuantity = 0) {
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(institutionId) || !/^[a-z][a-z0-9_]{2,79}$/.test(entitlementKey) || !Number.isSafeInteger(requestedQuantity) || requestedQuantity < 0) return false;
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc('commercial_entitlement_check', {
    p_institution: institutionId,
    p_entitlement_key: entitlementKey,
    p_requested_quantity: requestedQuantity,
  });
  return !error && data === true;
}
