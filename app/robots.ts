import type { MetadataRoute } from 'next';
import { appUrl } from '@/lib/server/config';
export const dynamic = 'force-dynamic';
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === 'preview') return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/account',
        '/login',
        '/dashboard',
        '/admin',
        '/preview',
        '/auth/',
        '/api/',
        '/s/',
      ],
    },
    sitemap: new URL('/sitemap.xml', appUrl()).href,
  };
}
