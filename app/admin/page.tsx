import { redirect } from 'next/navigation';

/**
 * The command center is the single admin experience. Keeping this entry point
 * free of database reads avoids rendering a second, slower dashboard before
 * users reach the workspace they actually use.
 */
export default function AdminPage() {
  redirect('/admin/dashboard');
}

