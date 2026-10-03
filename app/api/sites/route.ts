import { z } from 'zod';
import { emptyContent, contentSchema } from '@/lib/content';
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
        template: z.enum(['hyehwa', 'cafe', 'salon', 'fitness', 'market', 'professional', 'care']),
        owner: z.uuid().optional(),
        content: contentSchema.optional(),
      })
      .parse(await readJson(request));
    const content = input.content || {
      ...emptyContent(),
      template: input.template,
      layout: 'catalog',
      options: { pages: 1, nav: 'right', mobileNav: 'hamburger', features: [], links: {} },
    };
    if (input.owner && !user.admin) throw new Error('FORBIDDEN');
    return json(
      await rpc(user, input.owner ? 'create_customer_site' : 'create_site', {
        ...(input.owner ? { p_owner: input.owner } : {}),
        p_slug: input.slug,
        p_content: content,
      }),
    );
  } catch (error) {
    return failure(error);
  }
}
