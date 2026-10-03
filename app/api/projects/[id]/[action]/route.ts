import { randomUUID } from 'node:crypto';
import { after } from 'next/server';
import { z } from 'zod';
import { apiUser, sameOrigin, readJson, json, failure, HttpError } from '@/lib/server/http';
import { rpc } from '@/lib/server/data';
import { prepareFile, putFile, deleteProjectFile } from '@/lib/server/storage';
import { deliverNotifications } from '@/lib/server/notifications';
import { quoteSchema, stages, type ProjectFile } from '@/lib/projects';
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  try {
    sameOrigin(request);
    const user = await apiUser(request);
    const { id, action } = await params;
    z.uuid().parse(id);
    if (action === 'upload') {
      await rpc(user, 'get_project', { p_project: id });
      if (Number(request.headers.get('content-length') || 0) > 3200000)
        throw new HttpError(413, '파일은 3MB 이하로 선택하세요.');
      const form = await request.formData(),
        file = form.get('file');
      if (!(file instanceof File)) throw new HttpError(400, '파일을 선택하세요.');
      if (form.get('consent') !== 'true')
        throw new HttpError(400, '자료 제공 안내를 확인해 주세요.');
      const { bytes, mime } = await prepareFile(file);
      const asset = await rpc<ProjectFile>(user, 'register_project_file', {
        p_project: id,
        p_id: randomUUID(),
        p_name: file.name,
        p_bytes: bytes.length,
        p_mime: mime,
        p_consent: true,
      });
      try {
        await putFile(asset.path, bytes, mime, 'project-files');
      } catch (e) {
        await rpc(user, 'remove_project_file', { p_project: id, p_file: asset.id });
        throw e;
      }
      return json(asset);
    }
    const input = await readJson(request);
    if (action === 'update') {
      if (!user.admin) throw new HttpError(403, '운영자만 수정할 수 있습니다.');
      const body = z
        .object({
          version: z.number().int().positive(),
          stage: z.enum(Object.keys(stages) as [keyof typeof stages, ...(keyof typeof stages)[]]),
          message: z.string().max(3000),
          quote: quoteSchema,
        })
        .parse(input);
      const result = await rpc(user, 'update_project', {
        p_project: id,
        p_expected: body.version,
        p_stage: body.stage,
        p_message: body.message,
        p_quote: body.quote,
      });
      after(async () => {
        try {
          await deliverNotifications();
        } catch {}
      });
      return json(result);
    }
    if (action === 'quote-seen') {
      await rpc(user, 'see_project_quote', {
        p_project: id,
        p_expected: z.number().int().positive().parse(input.version),
      });
      return json({ ok: true });
    }
    if (action === 'remove-file') {
      const f = await rpc<ProjectFile>(user, 'remove_project_file', {
        p_project: id,
        p_file: z.uuid().parse(input.file),
      });
      await deleteProjectFile(f.path);
      return json({ ok: true });
    }
    throw new HttpError(404, '찾을 수 없습니다.');
  } catch (e) {
    return failure(e);
  }
}
