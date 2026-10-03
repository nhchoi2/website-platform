import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { websocketTransport } from './lib/websocket';
import { isPlatformHost } from './lib/hosts';
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const platform = isPlatformHost(request.headers.get('host') || '');
  if (
    !platform &&
    !['/', '/about', '/services', '/visit'].includes(pathname) &&
    !pathname.startsWith('/api/media/')
  )
    return new NextResponse('Not found', { status: 404 });
  let response = NextResponse.next({ request });
  response.headers.set('Cache-Control', 'private, no-store');
  const needsSession =
    ['/admin', '/dashboard', '/account', '/login', '/auth'].some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
    ) ||
    pathname === '/preview' ||
    pathname.startsWith('/preview/') ||
    (pathname.startsWith('/api/') &&
      (!pathname.startsWith('/api/media/') || request.nextUrl.searchParams.get('private') === '1'));
  if (
    platform &&
    needsSession &&
    process.env.APP_MODE === 'supabase' &&
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_PUBLISHABLE_KEY
  ) {
    const client = createServerClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PUBLISHABLE_KEY,
      {
        realtime: { transport: websocketTransport },
        cookieOptions: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        },
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookies) => {
            cookies.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            response.headers.set('Cache-Control', 'private, no-store');
            cookies.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );
    // Refresh/verify the signed token here. Each protected page/API still calls
    // currentUser().getUser() to check the live session and role before returning data.
    await client.auth.getClaims();
  }
  // Apply these after session refresh, which can replace the response object.
  if (
    process.env.VERCEL_ENV === 'preview' ||
    [
      '/dashboard',
      '/admin',
      '/preview',
      '/template-preview/',
      '/login',
      '/account',
      '/auth',
      '/api',
      '/s/',
    ].some((prefix) => pathname.startsWith(prefix))
  )
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
