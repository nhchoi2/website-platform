import { z } from 'zod';
import { after } from 'next/server';
import { deliverNotifications } from '@/lib/server/notifications';
import { Zip, ZipPassThrough, strToU8 } from 'fflate';
import { assetIds } from '@/lib/content';
import { apiUser, sameOrigin, readJson, json, failure, HttpError } from '@/lib/server/http';
import { rpc, siteDetail } from '@/lib/server/data';
import { getImage } from '@/lib/server/storage';
import { isPlatformHost } from '@/lib/hosts';
type Context = { params: Promise<{ id: string; action: string }> };
export async function POST(request: Request, context: Context) {
  try {
    sameOrigin(request);
    const user = await apiUser(request, true);
    const { id, action } = await context.params;
    z.uuid().parse(id);
    const body = await readJson(request);
    if (action === 'review') {
      const data = z
        .object({
          submission: z.uuid(),
          revision: z.uuid(),
          action: z.enum(['approve', 'changes']),
          feedback: z.string().max(4000),
          key: z.uuid(),
        })
        .parse(body);
      if (data.action === 'approve') {
        const detail = await siteDetail(user, id);
        const revision = detail.revisions.find((r) => r.id === data.revision);
        if (!revision) throw new HttpError(404, '제출본을 찾을 수 없습니다.');
        // Verify every referenced object before the atomic publish. No public pointer changes on failure.
        for (const assetId of assetIds(revision.content)) {
          const asset = detail.assets.find((a) => a.id === assetId);
          if (!asset) throw new Error('Missing image');
          await getImage(asset.path);
        }
      }
      const result = await rpc(user, 'review_submission', {
        p_site: id,
        p_submission: data.submission,
        p_revision: data.revision,
        p_action: data.action,
        p_feedback: data.feedback,
        p_key: data.key,
      });
      after(async () => {
        try {
          await deliverNotifications();
        } catch {}
      });
      return json(result);
    }
    if (action === 'restore') {
      const data = z.object({ revision: z.uuid(), expected: z.uuid(), key: z.uuid() }).parse(body);
      const detail = await siteDetail(user, id);
      const revision = detail.revisions.find((r) => r.id === data.revision);
      if (!revision) throw new HttpError(404, '버전을 찾을 수 없습니다.');
      for (const assetId of assetIds(revision.content)) {
        const asset = detail.assets.find((a) => a.id === assetId);
        if (!asset) throw new Error('Missing image');
        await getImage(asset.path);
      }
      const result = await rpc(user, 'restore_publication', {
        p_site: id,
        p_revision: data.revision,
        p_expected: data.expected,
        p_key: data.key,
      });
      after(async () => {
        try {
          await deliverNotifications();
        } catch {}
      });
      return json(result);
    }
    if (action === 'domain') {
      const data = z
        .object({
          hostname: z
            .string()
            .trim()
            .toLowerCase()
            .max(253)
            .regex(/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z][a-z0-9-]*$/),
          status: z.enum(['pending', 'connected', 'error']),
          expires: z.iso.date().nullable(),
          notes: z.string().max(2000),
        })
        .parse(body);
      if (isPlatformHost(data.hostname))
        throw new HttpError(400, '관리 서비스 주소는 고객 도메인으로 등록할 수 없습니다.');
      return json(
        await rpc(user, 'save_domain', {
          p_site: id,
          p_hostname: data.hostname,
          p_status: data.status,
          p_expires: data.expires,
          p_notes: data.notes,
        }),
      );
    }
    throw new HttpError(404, '찾을 수 없습니다.');
  } catch (error) {
    return failure(error);
  }
}
export async function GET(request: Request, context: Context) {
  try {
    const user = await apiUser(request, true);
    const { id, action } = await context.params;
    if (action !== 'export') throw new HttpError(404, '찾을 수 없습니다.');
    const detail = await siteDetail(user, z.uuid().parse(id));
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const zip = new Zip((error, data, final) => {
          if (cancelled) return;
          if (error) {
            controller.error(error);
            cancelled = true;
            return;
          }
          controller.enqueue(data);
          if (final) controller.close();
        });
        const add = (name: string, bytes: Uint8Array) => {
          const file = new ZipPassThrough(name);
          zip.add(file);
          file.push(bytes, true);
        };
        try {
          add(
            'site.json',
            strToU8(
              JSON.stringify(
                { format: 1, exportedAt: new Date().toISOString(), ...detail },
                null,
                2,
              ),
            ),
          );
          add(
            'README.txt',
            strToU8(
              '파일은 files/{assetId}.webp 또는 .pdf에 저장됩니다. site.json의 assets가 원본 파일명과 버전을 매핑합니다. 계정 비밀번호/인증 세션은 포함하지 않습니다. 복구 방법은 프로젝트 README를 참고하세요.',
            ),
          );
          for (const asset of detail.assets) {
            if (cancelled) break;
            add(
              `files/${asset.id}.${asset.mime === 'application/pdf' ? 'pdf' : 'webp'}`,
              new Uint8Array(await getImage(asset.path)),
            );
          }
          if (!cancelled) zip.end();
        } catch (error) {
          if (!cancelled) {
            controller.error(error);
            cancelled = true;
          }
        }
      },
      cancel() {
        cancelled = true;
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${detail.site.slug}-backup.zip"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    return failure(error);
  }
}
