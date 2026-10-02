import { z } from 'zod';
import type { Asset } from '@/lib/types';
import { isPlatformHost, normalizeHost } from '@/lib/hosts';
import { currentUser } from '@/lib/server/auth';
import { rpc, siteDetail } from '@/lib/server/data';
import { getImage } from '@/lib/server/storage';
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    z.uuid().parse(id);
    const params = new URL(request.url).searchParams;
    const host = normalizeHost(request.headers.get('host') || '');
    const platform = isPlatformHost(host);
    let asset: Asset | null = null;
    if (params.get('private') === '1' && platform) {
      const user = await currentUser();
      if (!user) return new Response(null, { status: 404 });
      const detail = await siteDetail(user, z.uuid().parse(params.get('site')));
      asset = detail.assets.find((a) => a.id === id) || null;
    } else
      asset = await rpc<Asset | null>(null, 'get_public_asset', {
        p_id: id,
        p_host: platform ? null : host,
      });
    if (!asset) return new Response(null, { status: 404 });
    const bytes = await getImage(asset.path);
    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
}
