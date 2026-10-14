import { z } from 'zod';
import { apiUser, sameOrigin, json, failure } from '@/lib/server/http';
import { rpc } from '@/lib/server/data';
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    sameOrigin(request);
    const user = await apiUser(request, true);
    const { id } = await params;
    z.uuid().parse(id);
    await rpc(user, 'resume_design_proposal', { p_id: id });
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
