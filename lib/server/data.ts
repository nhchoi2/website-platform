import 'server-only';
import { mode } from './config';
import { publicClient, sessionClient } from './supabase';
import type { User, SiteDetail, SiteSummary } from '../types';
export async function rpc<T>(
  user: User | null,
  name: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  if (mode() === 'local') {
    const { localDatabase, localRpc } = await import('../local/database');
    return localRpc<T>(await localDatabase(), user?.id || null, name, args);
  }
  const client = user ? await sessionClient() : publicClient();
  const { data, error } = await client.rpc(name, args);
  if (error) throw error;
  return data as T;
}
export const siteDetail = (user: User, id: string) =>
  rpc<SiteDetail>(user, 'get_site_detail', { p_site: id });
export const listSites = (user: User) => rpc<SiteSummary[]>(user, 'list_sites');
