import 'server-only';
import { createHmac } from 'node:crypto';
import { mode } from './config';
import { serviceRpc } from './service-rpc';
import { selectionFromInput, type InquiryInput } from '../inquiries';
export async function submitInquiry(input: InquiryInput, customerId: string | null = null) {
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
  try {
    return await serviceRpc<string>('submit_notified_inquiry', {
      ...args,
      p_customer: customerId,
      p_admin_email: process.env.NOTIFICATION_ADMIN_EMAIL || 'koofylab@gmail.com',
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String((error as { message?: string })?.message || '');
    throw new Error(
      message.includes('RATE_LIMIT')
        ? 'RATE_LIMIT'
        : message.includes('IDEMPOTENCY_CONFLICT')
          ? 'IDEMPOTENCY_CONFLICT'
          : 'INQUIRY_UNAVAILABLE',
    );
  }
}

export function inquiryEnabled() {
  return mode() === 'local' || process.env.INQUIRIES_ENABLED === 'true';
}
