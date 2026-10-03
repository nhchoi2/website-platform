import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { contentSchema } from '@/lib/content';
import type { Asset } from '@/lib/types';
import { apiUser, sameOrigin, readJson, json, failure, HttpError } from '@/lib/server/http';
import { rpc, siteDetail } from '@/lib/server/data';
import { prepareFile, putFile, deleteImage } from '@/lib/server/storage';
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; action: string }> },
) {
  try {
    sameOrigin(request);
    const user = await apiUser(request);
    const { id, action } = await context.params;
    z.uuid().parse(id);
    if (action === 'upload') {
      const detail = await siteDetail(user, id);
      if (detail.site.owner_id !== user.id && !user.admin)
        throw new HttpError(403, '매장 소유자만 업로드할 수 있습니다.');
      if (Number(request.headers.get('content-length') || 0) > 3_200_000)
        throw new HttpError(413, '사진은 3MB 이하로 업로드하세요.');
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File)) throw new HttpError(400, '사진을 선택하세요.');
      const prepared = await prepareFile(file);
      const image = prepared.bytes;
      const asset = await rpc<Asset>(
        user,
        prepared.mime === 'application/pdf' ? 'register_document' : 'register_asset',
        {
          p_site: id,
          p_id: randomUUID(),
          p_name: file.name,
          p_bytes: image.length,
        },
      );
      try {
        await putFile(asset.path, image, prepared.mime);
      } catch (error) {
        await rpc(user, 'remove_asset', { p_site: id, p_asset: asset.id });
        throw error;
      }
      return json(asset);
    }
    const body = await readJson(request);
    if (action === 'save') {
      const data = z
        .object({ version: z.number().int().positive(), content: contentSchema })
        .parse(body);
      return json(
        await rpc(user, 'save_draft', {
          p_site: id,
          p_expected: data.version,
          p_content: data.content,
        }),
      );
    }
    if (action === 'submit') {
      const data = z.object({ version: z.number().int().positive(), key: z.uuid() }).parse(body);
      return json(
        await rpc(user, 'submit_site', { p_site: id, p_expected: data.version, p_key: data.key }),
      );
    }
    if (action === 'remove-asset') {
      const asset = await rpc<Asset>(user, 'remove_asset', {
        p_site: id,
        p_asset: z.uuid().parse(body.assetId),
      });
      await deleteImage(asset.path);
      return json({ ok: true });
    }
    throw new HttpError(404, '찾을 수 없습니다.');
  } catch (error) {
    return failure(error);
  }
}
