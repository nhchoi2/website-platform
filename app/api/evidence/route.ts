import { z } from 'zod';
import { apiUser, sameOrigin, readJson, json, failure } from '@/lib/server/http';
import { rpc } from '@/lib/server/data';
import { evidenceSchema } from '@/lib/projects';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await apiUser(request);
    const i = evidenceSchema.parse(await readJson(request));
    return json({
      id: await rpc(user, 'request_evidence', {
        p_project: i.project,
        p_key: i.key,
        p_kind: i.kind,
        p_identifier: i.identifier,
        p_name: i.name,
        p_email: i.email,
        p_type: i.identifierType,
        p_consent: true,
      }),
    });
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    const user = await apiUser(request);
    const i = z
      .object({
        id: z.uuid(),
        status: z.enum(['issued', 'rejected', 'withdrawn']),
        reference: z.string().max(200),
        message: z.string().max(2000),
      })
      .parse(await readJson(request));
    await rpc(user, 'update_evidence', {
      p_id: i.id,
      p_status: i.status,
      p_reference: i.reference,
      p_message: i.message,
    });
    return json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
