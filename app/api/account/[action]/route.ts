import { z } from 'zod';
import { apiUser, sameOrigin, readJson, json, failure } from '@/lib/server/http';
import { rpc } from '@/lib/server/data';
import { TERMS_VERSION, PRIVACY_VERSION } from '@/lib/legal';
import { legalPublished } from '@/lib/server/legal';
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    sameOrigin(request);
    const user = await apiUser(request, false, true);
    const { action } = await context.params;
    const input = await readJson(request);
    if (action === 'consent') {
      if (!legalPublished())
        return json(
          { error: '운영자가 약관 안내를 준비 중입니다. 잠시 후 다시 확인해 주세요.' },
          503,
        );
      const data = z
        .object({
          accepted: z.literal(true),
          termsVersion: z.literal(TERMS_VERSION),
          privacyVersion: z.literal(PRIVACY_VERSION),
        })
        .parse(input);
      await rpc(user, 'accept_account_terms', {
        p_terms: data.termsVersion,
        p_privacy: data.privacyVersion,
      });
      return json({ ok: true });
    }
    if (action === 'contact') {
      const data = z
        .object({
          name: z.string().trim().max(80),
          phone: z
            .string()
            .max(30)
            .transform((v) => v.replace(/[\s()-]/g, '')),
          consent: z.boolean(),
        })
        .parse(input);
      return json(
        await rpc(user, 'save_account_contact', {
          p_name: data.name,
          p_phone: data.phone,
          p_consent: data.consent,
        }),
      );
    }
    return json({ error: '찾을 수 없습니다.' }, 404);
  } catch (error) {
    return failure(error);
  }
}
