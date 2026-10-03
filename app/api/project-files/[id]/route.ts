import { z } from 'zod';
import { apiUser } from '@/lib/server/http';
import { rpc } from '@/lib/server/data';
import { getProjectFile } from '@/lib/server/storage';
import type { ProjectDetail } from '@/lib/projects';
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await apiUser(request);
    const id = z.uuid().parse((await params).id),
      project = z.uuid().parse(new URL(request.url).searchParams.get('project'));
    const detail = await rpc<ProjectDetail>(user, 'get_project', { p_project: project });
    const file = detail.files.find((x) => x.id === id);
    if (!file) return new Response(null, { status: 404 });
    const bytes = await getProjectFile(file.path);
    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': file.mime,
        'Content-Disposition': `attachment; filename="${file.id}.${file.mime === 'application/pdf' ? 'pdf' : 'webp'}"; filename*=UTF-8''${encodeURIComponent(file.name.replace(/[\r\n]/g, ''))}`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
}
