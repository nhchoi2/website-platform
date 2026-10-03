import assert from 'node:assert/strict';
import test from 'node:test';
import { findTemplate, demoContent } from '../templates/catalog/catalog';
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
  assert.match(body, /모션 · 프로그램형/);
  assert.match(body, /3페이지/);
  assert.match(body, /상담 플로팅 버튼/);
  assert.match(body, /상단 안내 배너/);
  assert.doesNotMatch(body, /예약 플로팅 버튼/);
  assert.deepEqual(quoteSummary(options), { base: 390000, needsQuote: true });
  assert.equal(quoteSummary(parseOptions({})).needsQuote, false);
});

test('basic business content and menu layout choices do not trigger an extra quote', () => {
  const basic = parseOptions({
    features: 'priceTable,team,schedule,process,faq,top',
    nav: 'center',
    mobileNav: 'hamburger',
  });
  assert.equal(quoteSummary(basic).needsQuote, false);
  assert.equal(quoteSummary({ ...basic, pages: 3 }).needsQuote, true);
  for (const feature of ['gallery', 'news', 'consult', 'reserve', 'place', 'kakao', 'notice']) {
    assert.equal(
      quoteSummary(parseOptions({ features: `priceTable,${feature}` })).needsQuote,
      true,
    );
  }
  const body = new URL(inquiryHref(findTemplate('hyehwa')!, basic)).searchParams.get('body')!;
  assert.match(body, /기본 포함 선택: 가격·서비스 비교표/);
  assert.match(body, /유료 추가 선택: 없음/);
  assert.match(body, /메뉴 위치: 가운데/);
  assert.match(body, /모바일 메뉴: 메뉴 버튼/);
  assert.deepEqual(
    parseOptions(Object.fromEntries(new URLSearchParams(optionsQuery(basic)))),
    basic,
  );
  assert.equal(parseOptions({ nav: 'arbitrary-css', mobileNav: 'unknown' }).nav, undefined);
  assert.equal(parseOptions({ nav: 'arbitrary-css', mobileNav: 'unknown' }).mobileNav, undefined);
});

test('a design accepts another industry without changing its layout identity, palette or URL', () => {
  const design = findTemplate('salon')!;
  const food = findTemplate('hyehwa')!;
  const options = parseOptions({
    pages: '4',
    business: 'hyehwa',
    features: 'gallery,priceTable,team,schedule,news,process',
  });
  const content = demoContent(design, options.business);
  assert.equal(content.slug, design.slug);
  assert.equal(content.name, design.name);
  assert.equal(content.accent, design.accent);
  assert.equal(content.brand, food.brand);
  assert.equal(content.artSlug, food.slug);
  assert.deepEqual(content.items, food.items);
  assert.equal(content.serviceLabel, '메뉴');
  assert.deepEqual(
    parseOptions(Object.fromEntries(new URLSearchParams(optionsQuery(options)))),
    options,
  );
  assert.match(
    previewHref(design.slug, 'visit', options),
    /\/salon\/visit\?pages=4&business=hyehwa&features=/,
  );
  const body = new URL(inquiryHref(design, options)).searchParams.get('body')!;
  assert.match(body, /아틀리에/);
  assert.match(body, /예시 콘텐츠 업종: 음식점/);
  assert.match(body, /가격·서비스 비교표/);
  assert.equal(parseOptions({ business: 'unknown' }).business, undefined);
  assert.equal(demoContent(design, 'unknown').brand, design.brand);
});
