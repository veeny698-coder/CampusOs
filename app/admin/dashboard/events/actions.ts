'use server';
import { revalidatePath } from 'next/cache';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';
export type CreateEventState = { ok: boolean; message: string };
export async function createEventDraft(_previous: CreateEventState, form: FormData): Promise<CreateEventState> {
  const title = String(form.get('title') ?? '').trim();
  const institutionId = String(form.get('institution_id') ?? '').trim();
  if (title.length < 3 || title.length > 180) return {ok:false,message:'Event title must be 3–180 characters.'};
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(institutionId)) return {ok:false,message:'Select a valid institution.'};
  if (form.get('confirmed') !== 'yes') return {ok:false,message:'Confirm creation of the draft event.'};
  try {
    const access = await getVerifiedPlatformOwner();
    if (!access) return {ok:false,message:'Not authorized to create events.'};
    const {error} = await access.client.rpc('create_event_draft',{p_institution_id:institutionId,p_title:title});
    if (error) return {ok:false,message:'Unable to create draft. Verify institution and permissions.'};
    revalidatePath('/admin/dashboard/events');
    revalidatePath('/admin/dashboard');
    return {ok:true,message:'Draft event created successfully and logged.'};
  } catch {return {ok:false,message:'Event service unavailable. Try again later.'};}
}

export async function setEventPublication(form: FormData): Promise<void> {
  const id = String(form.get('event_id') ?? '');
  const action = String(form.get('action') ?? '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return;
  if (action !== 'publish' && action !== 'unpublish') return;
  const access = await getVerifiedPlatformOwner();
  if (!access) return;
  const { error } = await access.client.rpc('set_event_publication', { p_event_id: id, p_publish: action === 'publish' });
  if (error) throw new Error('Unable to update event publication status.');
  revalidatePath('/admin/dashboard/events');
  revalidatePath('/events/' + id);
}
