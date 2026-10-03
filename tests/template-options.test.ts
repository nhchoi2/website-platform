import assert from 'node:assert/strict';
import test from 'node:test';
import { findTemplate } from '../templates/catalog/catalog';
import {
  parseOptions,
  optionsQuery,
  previewHref,
  inquiryHref,
  safeExternalLink,
  quoteSummary,
  demoPages,
} from '../templates/catalog/options';

test('shared option links preserve only known features and safe external destinations', () => {
  const parsed = parseOptions({
    pages: '4',
    features: 'reserve,kakao,unknown,reserve',
    reserve: 'https://booking.naver.com/example',
    kakao: 'javascript:alert(1)',
  });
  assert.deepEqual(parsed.features, ['reserve', 'kakao']);
  assert.equal(parsed.links.kakao, undefined);
  assert.deepEqual(
    parseOptions(Object.fromEntries(new URLSearchParams(optionsQuery(parsed)))),
    parsed,
  );
  assert.equal(safeExternalLink('https://user:password@example.com'), '');
  assert.equal(safeExternalLink('data:text/html,test'), '');
  assert.equal(safeExternalLink('http://example.com'), '');
  assert.equal(safeExternalLink('//example.com'), '');
  const href = previewHref('salon', 'services', parsed);
  assert.match(href, /^\/template-preview\/salon\/services\?pages=4/);
  assert.match(href, /features=reserve%2Ckakao/);
});

test('navigation separates page count from one-page section menus and unknown counts fall back', () => {
  const template = findTemplate('professional')!;
  assert.deepEqual(
    demoPages(3, template).map((page) => page.id),
    ['home', 'services', 'visit'],
  );
  assert.deepEqual(
    demoPages(4, template).map((page) => page.id),
    ['home', 'about', 'services', 'visit'],
  );
  assert.equal(parseOptions({ pages: '999' }).pages, 1);
  assert.equal(findTemplate('unknown'), undefined);
});

test('inquiry contains selected configuration and never invents unknown add-on prices', () => {
  const template = findTemplate('fitness')!;
  const options = parseOptions({ pages: '3', features: 'consult,notice' });
  const url = new URL(inquiryHref(template, options));
  assert.equal(url.pathname, 'koofylab@gmail.com');
  const body = url.searchParams.get('body')!;
  assert.match(body, /모브 스튜디오/);
  assert.match(body, /3페이지/);
  assert.match(body, /상담 플로팅 버튼/);
  assert.match(body, /상단 안내 배너/);
  assert.doesNotMatch(body, /예약 플로팅 버튼/);
  assert.deepEqual(quoteSummary(options), { base: 390000, needsQuote: true });
  assert.equal(quoteSummary(parseOptions({})).needsQuote, false);
});
