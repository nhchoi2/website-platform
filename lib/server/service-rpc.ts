import 'server-only';
import { mode } from './config';
import { serviceClient } from './supabase';
const parameters: Record<string, string[]> = {
  submit_notified_inquiry: [
    'p_key',
    'p_name',
    'p_business',
    'p_method',
    'p_contact',
    'p_message',
    'p_selection',
    'p_contact_hash',
    'p_consent',
    'p_customer',
    'p_admin_email',
  ],
  claim_notifications: ['p_limit'],
  finish_notification: ['p_id', 'p_status', 'p_provider', 'p_error'],
};
export async function serviceRpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const params = parameters[name];
  if (!params) throw new Error('Unsupported service operation');
  if (mode() === 'local') {
    const { localDatabase } = await import('../local/database');
    return (await localDatabase()).transaction(async (tx) => {
      await tx.exec('set local role service_role');
      const result = await tx.query<{ result: T }>(
        `select public.${name}(${params.map((_, i) => `$${i + 1}`).join(',')}) as result`,
        params.map((k) =>
          typeof args[k] === 'object' && args[k] !== null
            ? JSON.stringify(args[k])
            : (args[k] ?? null),
        ),
      );
      return result.rows[0].result;
    });
  }
  const { data, error } = await serviceClient().rpc(name, args);
  if (error) throw error;
  return data as T;
}
