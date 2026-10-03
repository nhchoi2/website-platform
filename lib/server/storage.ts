import 'server-only';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { mode } from './config';
import { storageService } from './supabase';
import { HttpError } from './http';
const objectPath = (key: string) => {
  if (!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.(webp|pdf)$/.test(key))
    throw new Error('Invalid object path');
  return path.resolve(process.env.LOCAL_DATA_DIR || '.local-data', 'uploads', key);
};
export async function prepareImage(file: File) {
  if (file.size < 1 || file.size > 3_000_000)
    throw new HttpError(400, '사진은 3MB 이하로 업로드하세요.');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw new HttpError(400, 'JPG, PNG, WebP 사진을 선택하세요.');
  try {
    return await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    throw new HttpError(400, '읽을 수 없는 이미지입니다. 다른 사진을 선택하세요.');
  }
}
export async function putImage(key: string, data: Buffer) {
  if (mode() === 'local') {
    const target = objectPath(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data, { flag: 'wx', mode: 0o600 });
    return;
  }
  const { error } = await storageService().upload(key, data, {
    contentType: 'image/webp',
    upsert: false,
  });
  if (error) throw error;
}
export async function getImage(key: string) {
  if (mode() === 'local') return readFile(objectPath(key));
  const { data, error } = await storageService().download(key);
  if (error || !data) throw error || new Error('Missing image');
  return Buffer.from(await data.arrayBuffer());
}
export async function deleteImage(key: string) {
  if (mode() === 'local') {
    await unlink(objectPath(key)).catch((e) => {
      if (e.code !== 'ENOENT') throw e;
    });
    return;
  }
  const { error } = await storageService().remove([key]);
  if (error) throw error;
}

// Documents are downloadable only; no HTML/SVG/scripts are accepted.
export async function prepareFile(file: File) {
  if (file.type !== 'application/pdf')
    return { bytes: await prepareImage(file), mime: 'image/webp' as const };
  if (file.size < 5 || file.size > 3_000_000)
    throw new HttpError(400, 'PDF는 3MB 이하로 업로드하세요.');
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.subarray(0, 5).toString() !== '%PDF-')
    throw new HttpError(400, '읽을 수 없는 PDF입니다.');
  return { bytes, mime: 'application/pdf' as const };
}
export async function putFile(
  key: string,
  data: Buffer,
  mime: string,
  bucket = 'restaurant-images',
) {
  if (mode() === 'local') {
    const target = bucket === 'project-files' ? projectObjectPath(key) : objectPath(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data, { flag: 'wx', mode: 0o600 });
    return;
  }
  const { error } = await storageService(bucket).upload(key, data, {
    contentType: mime,
    upsert: false,
  });
  if (error) throw error;
}
function projectObjectPath(key: string) {
  if (!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(webp|pdf)$/.test(key))
    throw new Error('Invalid project object path');
  return path.resolve(process.env.LOCAL_DATA_DIR || '.local-data', 'project-uploads', key);
}
export async function getProjectFile(key: string) {
  if (mode() === 'local') return readFile(projectObjectPath(key));
  const { data, error } = await storageService('project-files').download(key);
  if (error || !data) throw new Error('Missing file');
  return Buffer.from(await data.arrayBuffer());
}
export async function deleteProjectFile(key: string) {
  if (mode() === 'local') {
    await unlink(projectObjectPath(key)).catch((e) => {
      if (e.code !== 'ENOENT') throw e;
    });
    return;
  }
  const { error } = await storageService('project-files').remove([key]);
  if (error) throw error;
}
