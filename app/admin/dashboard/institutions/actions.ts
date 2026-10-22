'use server';
import { revalidatePath } from 'next/cache';
import { getVerifiedPlatformOwner } from '../../../../lib/auth/platform-owner';

export type CreateInstitutionState = { ok: boolean; message: string };
export async function createInstitution(_previous: CreateInstitutionState, form: FormData): Promise<CreateInstitutionState> {
  const name = String(form.get('name') ?? '').trim();
  const slug = String(form.get('slug') ?? '').trim().toLowerCase();
  if (name.length < 2 || name.length > 200) return { ok:false, message:'Institution name must be 2–200 characters.' };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 3 || slug.length > 60) return { ok:false, message:'Slug must be 3–60 lowercase letters, numbers or hyphen-separated words.' };
  try {
    const access = await getVerifiedPlatformOwner();
    if (!access) return { ok:false, message:'You are not authorized to create institutions.' };
    const { error } = await access.client.from('institutions').insert({ name, slug });
    if (error) {
      if (error.code === '23505') return { ok:false, message:'This institution slug is already taken.' };
      return { ok:false, message:'Unable to create institution. Please try again or contact support.' };
    }
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/dashboard/institutions');
    return { ok:true, message:'Institution created successfully. Audit entry recorded.' };
  } catch { return { ok:false, message:'The service is unavailable. Try again later.' }; }
}
