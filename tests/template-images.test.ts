import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, stat } from 'node:fs/promises';
import sharp from 'sharp';
import { templateCatalog, demoContent } from '../templates/catalog/catalog';
import { templateImageSets, templatePhotos } from '../templates/catalog/images';

test('every template photo resolves to a compact, valid deployable WebP in both sizes', async () => {
  assert.equal(Object.keys(templateImageSets).length, templateCatalog.length);
  const assets = new Set<string>();
  for (const template of templateCatalog) {
    const set = templatePhotos(template);
    assert.equal(set.items.length, template.items.length);
    assert.equal(new Set(set.items.map((x) => x.src)).size, template.items.length);
    for (const photo of [set.hero, ...set.items]) {
      assert.ok(photo.alt);
      assets.add(photo.src);
      assets.add(photo.small);
    }
  }
  for (const asset of assets) {
    const file = `public${asset}`;
    const metadata = await sharp(await readFile(file)).metadata();
    assert.equal(metadata.format, 'webp');
    assert.equal(metadata.width, asset.endsWith('-small.webp') ? 640 : 1440);
    assert.ok((await stat(file)).size < 250_000, `${asset} exceeds photo budget`);
  }
});

test('changing business content selects matching photos while retaining the selected design', () => {
  const salon = templateCatalog.find((x) => x.slug === 'salon')!;
  const food = demoContent(salon, 'hyehwa');
  assert.equal(food.slug, 'salon');
  assert.equal(templatePhotos(food).hero.src, '/template-images/hyehwa.webp');
  assert.equal(templatePhotos(food).items[1].src, '/template-images/hyehwa-1.webp');
});
