import 'server-only';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { mode } from './config';
import { storageService } from './supabase';
import { HttpError } from './http';
const objectPath = (key: string) => {
  if (!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.webp$/.test(key))
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
