import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { mode } from './config';
import { sessionClient } from './supabase';
import { isPlatformHost } from '../hosts';
import type { User } from '../types';
import { legalPublished } from './legal';
// React cache only deduplicates within one server render; never share identity across requests.
export const currentUser = cache(async (): Promise<User | null> => {
  if (!isPlatformHost((await headers()).get('host') || '')) return null;
  if (mode() === 'local') {
    const token = (await cookies()).get('restaurant_session')?.value;
    if (!token) return null;
    const { localDatabase } = await import('../local/database');
    const { localSession } = await import('../local/auth');
    return localSession(await localDatabase(), token);
  }
  const client = await sessionClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  const { data, error: roleError } = await client.rpc('is_admin');
  if (roleError) throw roleError;
  return { id: user.id, email: user.email || '', admin: !!data };
});
export async function requireUser(admin = false, skipConsent = false) {
  const user = await currentUser();
  if (!user) redirect('/login');
  if (admin && !user.admin) notFound();
  if (!skipConsent && legalPublished()) {
    const { rpc } = await import('./data');
    if (!(await rpc<boolean>(user, 'has_account_consent'))) redirect('/account/consent');
  }
  return user;
}
