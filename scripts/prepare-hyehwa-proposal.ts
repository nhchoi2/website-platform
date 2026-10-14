// Explicit material provisioning. Customer data and share token stay in ignored local files.
// Remote mode uses only the narrow proposal RPCs and private proposal image namespace.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { createLocalDatabase } from '../lib/local/database';
import { proposalContentSchema, type ProposalContent } from '../lib/proposals';
import { websocketTransport } from '../lib/websocket';

const args = process.argv.slice(2);
const localIndex = args.indexOf('--local');
const remote = args.includes('--remote');
if ((localIndex === -1) === !remote)
  throw new Error('Choose --local <isolated data directory> OR --remote');
const materialDir = path.resolve('.local-data/client-materials/hyehwa-samgyeopsal');
const receiptFile = path.join(materialDir, 'proposal-receipt.json');
type Asset = { id: string; web: { path: string; width: number; height: number } };
const manifest = JSON.parse(
  await readFile(path.join(materialDir, 'download-manifest.json'), 'utf8'),
) as { assets: Asset[] };
const sourceMenus = JSON.parse(await readFile(path.join(materialDir, 'menus.json'), 'utf8')) as {
  items: {
    id: string;
    suggested_display_name: string;
    name: string;
    category: string;
    price_krw: number;
    description: string;
    featured_on_place: boolean;
  }[];
};
const store = JSON.parse(await readFile(path.join(materialDir, 'store-info.json'), 'utf8'));
let receipt: {
  id: string;
  token: string;
  imageIds: Record<string, string>;
  contentHash?: string;
  remotePublished?: boolean;
};
try {
  receipt = JSON.parse(await readFile(receiptFile, 'utf8'));
} catch {
  receipt = { id: randomUUID(), token: randomBytes(24).toString('hex'), imageIds: {} };
}
const heroes = ['business-067', 'business-084', 'business-052'];
const stories = ['business-060', 'business-059', 'business-074'];
const interiors = [
  'business-069',
  'business-071',
  'business-072',
  'business-073',
  'business-074',
  'business-076',
  'business-078',
  'business-079',
];
const exteriors = ['business-088', 'business-089'];
const menuRows = sourceMenus.items.filter((menu) => menu.price_krw > 0);
const wanted = [
  ...new Set([...heroes, ...stories, ...interiors, ...exteriors, ...menuRows.map((m) => m.id)]),
];
const assets = wanted.map((id) => {
  const asset = manifest.assets.find((a) => a.id === id);
  if (!asset?.web) throw new Error('Missing prepared material: ' + id);
  receipt.imageIds[id] ||= randomUUID();
  return asset;
});
const imageId = (id: string) => receipt.imageIds[id];
const labels: Record<string, string> = {
  'business-067': '대나무통으로 준비하는 삼겹살',
  'business-084': '돌판 위에서 구워지는 양념 삼겹살',
  'business-052': '대나무통에서 꺼내는 삼겹살',
  'business-060': '대나무통과 신선한 한돈 삼겹살',
  'business-059': '대통령의 음식과 공간이 함께 보이는 한 상',
  'business-088': '혜화 삼겹살 대통령 매장 외관',
  'business-089': '대통령 매장 간판',
};
const content: ProposalContent = proposalContentSchema.parse({
  name: store.name,
  shortName: '혜화 삼겹살 대통령',
  tagline: '대나무에서 시작되는 특별한 한 점',
  introduction:
    '엄선한 1등급 한돈을 대나무통에서 초벌하거나 숙성해 대통령만의 삼겹살을 준비합니다.\n\n대학로에서의 공연 전후 식사부터 데이트, 가족모임과 회식까지. 좋은 사람들과 편안한 한 끼를 나눠보세요.',
  address: store.address,
  phone: store.phone,
  hours: '매일 11:30–23:00\n평일 브레이크타임 15:00–16:00',
  parking: store.parking.note,
  links: {
    place: store.links.naver_place,
    instagram: 'https://www.instagram.com/daetongryeong_hyehwa?utm_source=qr',
    kakao: null,
  },
  heroIds: heroes.map(imageId),
  storyIds: stories.map(imageId),
  interiorIds: interiors.map(imageId),
  exteriorIds: exteriors.map(imageId),
  menus: menuRows.map((menu) => ({
    id: menu.id,
    name: menu.suggested_display_name,
    category: menu.category,
    price: menu.price_krw,
    description: menu.description,
    featured: menu.featured_on_place,
    imageId: imageId(menu.id),
  })),
  images: assets.map((asset) => ({
    id: imageId(asset.id),
    label:
      labels[asset.id] || menuRows.find((menu) => menu.id === asset.id)?.name || '대통령 매장 내부',
    width: asset.web.width,
    height: asset.web.height,
  })),
  sourceDate: '2026-10-14',
  notes: [
    '사진과 매장 정보는 사장님이 지정한 네이버 플레이스 자료를 사용했습니다.',
    '세 시안은 같은 메뉴·가격·사진을 사용하며 디자인과 배치가 다릅니다.',
    '메뉴·가격·영업시간은 최종 공개 전 확인이 필요합니다.',
    '카카오톡 버튼은 연결 주소 확인 후 활성화합니다. 인스타그램·전화·플레이스 링크는 사용할 수 있습니다.',
  ],
});
const contentHash = createHash('sha256').update(JSON.stringify(content)).digest('hex');
if (receipt.contentHash && receipt.contentHash !== contentHash)
  throw new Error(
    'Material snapshot changed. Create a new receipt rather than overwriting a shared proposal.',
  );
receipt.contentHash = contentHash;
await writeFile(receiptFile, JSON.stringify(receipt, null, 2), { mode: 0o600 });
await writeFile(path.join(materialDir, 'proposal-content.json'), JSON.stringify(content, null, 2));
const hash = createHash('sha256').update(receipt.token).digest('hex');
const prepared = [];
for (const asset of assets) {
  const full = await sharp(path.join(materialDir, asset.web.path))
    .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 83 })
    .toBuffer();
  const small = await sharp(full)
    .resize({ width: 680, height: 680, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  for (const [size, bytes] of [
    ['full', full],
    ['small', small],
  ] as const)
    prepared.push({ key: `${receipt.id}/${imageId(asset.id)}/${size}.webp`, bytes });
}
if (localIndex !== -1) {
  const directory = path.resolve(args[localIndex + 1]);
  const db = await createLocalDatabase(directory);
  try {
    await db.transaction(async (tx) => {
      await tx.exec('set local role service_role');
      await tx.query('select create_design_proposal($1,$2,$3)', [
        receipt.id,
        hash,
        JSON.stringify(content),
      ]);
    });
    for (const file of prepared) {
      const target = path.join(directory, 'proposal-images', file.key);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.bytes, { mode: 0o600 });
    }
    await db.transaction(async (tx) => {
      await tx.exec('set local role service_role');
      await tx.query('select publish_design_proposal($1)', [receipt.id]);
    });
  } finally {
    await db.close();
  }
  console.log(
    JSON.stringify({
      mode: 'local',
      imageCount: assets.length,
      objectCount: prepared.length,
      directory,
      sharePath: `/proposals/${receipt.token}`,
    }),
  );
} else {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error('Missing server environment variables');
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: websocketTransport },
  });
  const created = await client.rpc('create_design_proposal', {
    p_id: receipt.id,
    p_hash: hash,
    p_content: content,
  });
  if (created.error) throw created.error;
  for (const file of prepared) {
    const { error } = await client.storage.from('proposal-images').upload(file.key, file.bytes, {
      contentType: 'image/webp',
      upsert: false,
      cacheControl: '600',
    });
    if (error) {
      if (!/duplicate|already exists|resource exists/i.test(error.message)) throw error;
      const existing = await client.storage.from('proposal-images').download(file.key);
      if (existing.error || !existing.data)
        throw new Error('Cannot verify existing proposal photo');
      const old = createHash('sha256')
        .update(Buffer.from(await existing.data.arrayBuffer()))
        .digest('hex');
      const expected = createHash('sha256').update(file.bytes).digest('hex');
      if (old !== expected) throw new Error('Existing immutable image differs');
    }
  }
  const published = await client.rpc('publish_design_proposal', { p_id: receipt.id });
  if (published.error) throw published.error;
  receipt.remotePublished = true;
  await writeFile(receiptFile, JSON.stringify(receipt, null, 2), { mode: 0o600 });
  console.log(
    JSON.stringify({
      mode: 'supabase',
      imageCount: assets.length,
      objectCount: prepared.length,
      totalBytes: prepared.reduce((sum, file) => sum + file.bytes.length, 0),
      sharePath: `/proposals/${receipt.token}`,
    }),
  );
}
