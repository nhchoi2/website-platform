import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { websocketTransport } from '../websocket';
import { supabaseConfig } from './config';
// Reuse the cookie-bound client only within this server render.
export const sessionClient = cache(async () => {
  const jar = await cookies();
  const { url, key } = supabaseConfig();
  return createServerClient(url, key, {
    realtime: { transport: websocketTransport },
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          /* Server Component: proxy refreshes the session. */
        }
      },
    },
  });
});
export function publicClient() {
  const { url, key } = supabaseConfig();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: websocketTransport },
  });
}
// Server-only privileged client, used only after authorization for narrow RPCs or private object I/O.
export function serviceClient() {
  const { url } = supabaseConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY가 필요합니다.');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: websocketTransport },
  });
}

export function storageService(bucket = 'restaurant-images') {
  return serviceClient().storage.from(bucket);
}
