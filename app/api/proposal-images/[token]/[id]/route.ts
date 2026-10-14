import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getProposal, proposalImagePath } from '@/lib/server/proposals';
import { mode } from '@/lib/server/config';
import { storageService } from '@/lib/server/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string; id: string }> },
) {
  try {
    const { token, id } = await params;
    if (!z.uuid().safeParse(id).success) return new Response(null, { status: 404 });
    const size = new URL(request.url).searchParams.get('size');
    if (size !== 'small' && size !== 'full') return new Response(null, { status: 404 });
    const proposal = await getProposal(token);
    if (!proposal || !proposal.content.images.some((image) => image.id === id))
      return new Response(null, { status: 404 });
    const key = proposalImagePath(proposal.id, id, size);
    let bytes: Buffer;
    if (mode() === 'local')
      bytes = await readFile(
        path.resolve(process.env.LOCAL_DATA_DIR || '.local-data', 'proposal-images', key),
      );
    else {
      const { data, error } = await storageService('proposal-images').download(key);
      if (error || !data) throw new Error('Missing proposal photo');
      bytes = Buffer.from(await data.arrayBuffer());
    }
    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'private, max-age=300',
        'X-Robots-Tag': 'noindex, nofollow',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
