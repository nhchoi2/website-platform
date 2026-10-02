import { z } from 'zod';
import { emptyContent } from '@/lib/content';
import { apiUser, sameOrigin, readJson, json, failure } from '@/lib/server/http';
import { rpc } from '@/lib/server/data';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await apiUser(request);
    const input = z
      .object({
        slug: z
          .string()
          .regex(
            /^[a-z0-9][a-z0-9-]{2,39}$/,
            '주소는 영문 소문자, 숫자, 하이픈으로 3~40자 입력하세요.',
          ),
        template: z.literal('hyehwa'),
      })
      .parse(await readJson(request));
    return json(await rpc(user, 'create_site', { p_slug: input.slug, p_content: emptyContent() }));
  } catch (error) {
    return failure(error);
  }
}
