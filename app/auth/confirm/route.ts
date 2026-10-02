import { NextResponse } from 'next/server';
import { sessionClient } from '@/lib/server/supabase';
import { appUrl, mode } from '@/lib/server/config';
import { isPlatformHost } from '@/lib/hosts';
export async function GET(request: Request) {
  if (!isPlatformHost(request.headers.get('host') || '') || mode() !== 'supabase')
    return new Response('Not found', { status: 404 });
  const params = new URL(request.url).searchParams;
  const token = params.get('token_hash');
  const type = params.get('type');
  const code = params.get('code');
  if (code) {
    const client = await sessionClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(params.get('flow') === 'recovery' ? '/login?mode=reset' : '/account', appUrl()),
        { headers: { 'Cache-Control': 'no-store' } },
      );
  }
  if (token && (type === 'signup' || type === 'recovery' || type === 'email')) {
    const client = await sessionClient();
    const { error } = await client.auth.verifyOtp({ token_hash: token, type });
    if (!error)
      return NextResponse.redirect(
        new URL(type === 'recovery' ? '/login?mode=reset' : '/account', appUrl()),
        { headers: { 'Cache-Control': 'no-store' } },
      );
  }
  return NextResponse.redirect(new URL('/login?error=expired', appUrl()));
}
