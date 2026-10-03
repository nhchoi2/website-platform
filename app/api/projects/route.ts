import { z } from 'zod';
import { apiUser, sameOrigin, readJson, json, failure } from '@/lib/server/http';
import { rpc } from '@/lib/server/data';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await apiUser(request, true);
    const input = z
      .object({ inquiry: z.uuid().nullable(), customer: z.uuid(), site: z.uuid().nullable() })
      .parse(await readJson(request));
    return json(
      await rpc(user, 'start_project', {
        p_inquiry: input.inquiry,
        p_customer: input.customer,
        p_site: input.site,
      }),
    );
  } catch (e) {
    return failure(e);
  }
}
