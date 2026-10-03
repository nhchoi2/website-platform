import 'server-only';
import { createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { mode, supabaseConfig } from './config';
import { websocketTransport } from '../websocket';
import { selectionFromInput, type InquiryInput } from '../inquiries';
export async function submitInquiry(input: InquiryInput) {
  const local = mode() === 'local';
  const secret = local ? 'local-consultation-demo-only' : process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('INQUIRY_UNAVAILABLE');
  const contact =
    input.method === 'email' ? input.contact.toLowerCase() : input.contact.replace(/[\s-]/g, '');
  const args = {
    p_key: input.key,
    p_name: input.name,
    p_business: input.business,
    p_method: input.method,
    p_contact: contact,
    p_message: input.message,
    p_selection: selectionFromInput(input),
    p_contact_hash: createHmac('sha256', secret).update(contact).digest('hex'),
    p_consent: input.consentVersion,
  };
  if (local) {
    const { localDatabase } = await import('../local/database');
    const db = await localDatabase();
    return db.transaction(async (tx) => {
      await tx.exec('set local role service_role');
      const values = Object.values(args).map((v) =>
        typeof v === 'object' ? JSON.stringify(v) : v,
      );
      const result = await tx.query<{ id: string }>(
        'select public.submit_inquiry($1,$2,$3,$4,$5,$6,$7,$8,$9) as id',
        values,
      );
      return result.rows[0].id;
    });
  }
  const { url } = supabaseConfig();
  // Narrow server-only function; never expose this client to customer data routes.
  const client = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: websocketTransport },
  });
  const { data, error } = await client.rpc('submit_inquiry', args);
  if (error)
    throw new Error(
      error.message.includes('RATE_LIMIT')
        ? 'RATE_LIMIT'
        : error.message.includes('IDEMPOTENCY_CONFLICT')
          ? 'IDEMPOTENCY_CONFLICT'
          : 'INQUIRY_UNAVAILABLE',
    );
  return data as string;
}
export function inquiryEnabled() {
  return mode() === 'local' || process.env.INQUIRIES_ENABLED === 'true';
}
