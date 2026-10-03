// Run after npm run build. An isolated local database is created and removed.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { request } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createLocalDatabase, localRpc } from '../lib/local/database';
import { localRegister } from '../lib/local/auth';
import { emptyContent } from '../lib/content';
import { legalAcceptance } from '../lib/legal';
import type { Site, SiteDetail, Submission } from '../lib/types';
import { templateCatalog } from '../templates/catalog/catalog';
const port = 3011;
const host = `127.0.0.1:${port}`;
const base = `http://${host}`;
const dir = await mkdtemp(join(tmpdir(), 'koofy-routing-'));
const db = await createLocalDatabase(dir);
const password = randomUUID() + 'aA1!';
const customer = await localRegister(db, 'customer@local.invalid', password, legalAcceptance);
const admin = await localRegister(db, 'admin@local.invalid', password, legalAcceptance);
await localRegister(db, 'existing@local.invalid', password);
await db.query('insert into admin_users(user_id) values($1)', [admin]);
const site = await localRpc<Site>(db, customer, 'create_site', {
  p_slug: 'customer-a',
  p_content: { ...emptyContent(), name: 'Customer A', address: 'Seoul', phone: '02-123-4567' },
});
const detail = await localRpc<SiteDetail>(db, customer, 'get_site_detail', { p_site: site.id });
const submission = await localRpc<Submission>(db, customer, 'submit_site', {
  p_site: site.id,
  p_expected: detail.site.draft_version,
  p_key: randomUUID(),
});
await localRpc(db, admin, 'review_submission', {
  p_site: site.id,
  p_submission: submission.id,
  p_revision: submission.revision_id,
  p_action: 'approve',
  p_feedback: '',
  p_key: randomUUID(),
});
await localRpc(db, admin, 'save_domain', {
  p_site: site.id,
  p_hostname: 'customer.local.test',
  p_status: 'connected',
  p_expires: null,
  p_notes: 'isolated routing test',
});
await db.close();
const env: NodeJS.ProcessEnv = {
  ...process.env,
  APP_MODE: 'local',
  APP_URL: base,
  PLATFORM_HOSTS: host,
  LOCAL_DATA_DIR: dir,
};
delete env.VERCEL;
delete env.VERCEL_ENV;
const server = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)],
  { env, stdio: ['ignore', 'pipe', 'pipe'] },
);
let logs = '';
server.stdout.on('data', (d) => {
  logs += d;
});
server.stderr.on('data', (d) => {
  logs += d;
});
function get(path: string, options: { host?: string; cookie?: string; body?: unknown } = {}) {
  return new Promise<{
    status: number;
    headers: import('node:http').IncomingHttpHeaders;
    body: string;
  }>((resolve, reject) => {
    const req = request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method: options.body ? 'POST' : 'GET',
        headers: {
          host: options.host || host,
          ...(options.cookie ? { cookie: options.cookie } : {}),
          ...(options.body ? { 'content-type': 'application/json', origin: base } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (d) => {
          body += d;
        });
        res.on('end', () => resolve({ status: res.statusCode!, headers: res.headers, body }));
      },
    );
    req.on('error', reject);
    req.end(options.body ? JSON.stringify(options.body) : undefined);
  });
}
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    try {
      if ((await get('/')).status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  assert.ok(ready, logs);
  for (const path of ['/', '/templates', '/templates/hyehwa', '/projects', '/pricing', '/guide']) {
    const res = await get(path);
    assert.equal(res.status, 200, path);
    assert.match(res.body, /rel="canonical"/);
    assert.doesNotMatch(res.body, /name="robots" content="noindex/);
    assert.equal(res.headers['x-robots-tag'], undefined);
  }
  assert.match((await get('/pricing')).body, /390,000원/);
  assert.match((await get('/pricing')).body, /44,000원/);
  assert.match((await get('/projects')).body, /Intranet System/);
  assert.equal((await get('/marketing/projects/yongs-dining.webp')).status, 200);
  assert.match((await get('/templates/hyehwa/classic?theme=warm')).body, /#653c2c/);
  const renderedLayouts = new Set<string>();
  for (const template of templateCatalog) {
    assert.equal((await get(`/templates/${template.slug}`)).status, 200);
    for (const pages of [1, 3, 4]) {
      const sections =
        pages === 1
          ? ['']
          : pages === 3
            ? ['', '/services', '/visit']
            : ['', '/about', '/services', '/visit'];
      for (const section of sections) {
        const res = await get(
          `/template-preview/${template.slug}${section}?pages=${pages}&features=reserve,notice,faq&reserve=https%3A%2F%2Fbooking.naver.com%2Fexample`,
        );
        assert.equal(res.status, 200, `${template.slug}/${pages}${section}`);
        assert.equal(res.headers['x-robots-tag'], 'noindex, nofollow');
        if (!section)
          renderedLayouts.add(res.body.match(/data-design="([a-z]+)"/)?.[1] || 'missing');
        assert.match(res.body, /네이버|예약하기/);
        assert.match(res.body, /https:\/\/booking.naver.com\/example/);
        assert.match(res.body, /휴무나 행사/);
        if (pages !== 1) assert.match(res.body, /features=reserve%2Cnotice%2Cfaq/);
        if (section === '/visit' || pages === 1) assert.match(res.body, /자주 묻는 질문/);
      }
    }
  }
  assert.equal(
    renderedLayouts.size,
    templateCatalog.length,
    'every design must use a distinct composition',
  );
  assert.ok(!renderedLayouts.has('missing'));
  const crossIndustry = await get(
    '/template-preview/salon/services?pages=4&business=hyehwa&features=gallery,priceTable,team,schedule,news,process',
  );
  assert.equal(crossIndustry.status, 200);
  assert.match(crossIndustry.body, /data-design="atelier"/);
  assert.match(crossIndustry.body, /담백한 식탁/);
  assert.match(crossIndustry.body, /숙성 삼겹살/);
  assert.match(crossIndustry.body, /business=hyehwa/);
  for (const id of ['gallery', 'priceTable', 'team', 'schedule', 'news', 'process'])
    assert.match(crossIndustry.body, new RegExp(`id="feature-${id}"`));
  // Client controls serialize all sample data in RSC scripts. Check the actual site content,
  // rather than treating non-rendered configuration data as visible business content.
  const crossIndustryMain = crossIndustry.body
    .split('<main id="demo-main">')[1]
    ?.split('</main>')[0];
  assert.ok(crossIndustryMain, 'cross-industry demo main content');
  assert.match(crossIndustryMain, /숙성 삼겹살/);
  assert.doesNotMatch(crossIndustryMain, /디자인 커트/);
  for (const path of [
    '/templates/unknown',
    '/template-preview/unknown',
    '/template-preview/salon/about?pages=3',
    '/template-preview/salon/services?pages=1',
    '/template-preview/salon/visit/extra?pages=4',
  ])
    assert.equal((await get(path)).status, 404, path);
  const unsafe = await get('/template-preview/salon?features=kakao&kakao=javascript%3Aalert(1)');
  assert.doesNotMatch(unsafe.body, /href="javascript:/);
  assert.equal((await get('/marketing/hyehwa-food.jpeg')).status, 200);
  for (const path of ['/account', '/dashboard', '/admin']) {
    const res = await get(path);
    assert.equal(res.status, 307);
    assert.equal(res.headers.location, '/login');
    assert.equal(res.headers['x-robots-tag'], 'noindex, nofollow');
  }
  const login = async (email: string) => {
    const res = await get('/api/auth/login', { body: { email, password } });
    assert.equal(res.status, 200);
    return res.headers['set-cookie']!.map((v) => v.split(';')[0]).join('; ');
  };
  const customerCookie = await login('customer@local.invalid');
  const adminCookie = await login('admin@local.invalid');
  const existingCookie = await login('existing@local.invalid');
  assert.equal(
    (await get('/dashboard', { cookie: existingCookie })).headers.location,
    '/account/consent',
  );
  assert.equal((await get('/account/consent', { cookie: existingCookie })).status, 200);
  assert.equal(
    (
      await get('/api/sites', {
        cookie: existingCookie,
        body: { slug: 'blocked-site', template: 'hyehwa' },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await get('/api/account/consent', {
        cookie: existingCookie,
        body: { accepted: true, termsVersion: '2026-10-03', privacyVersion: '2026-10-03' },
      })
    ).status,
    200,
  );
  assert.equal((await get('/dashboard', { cookie: existingCookie })).status, 200);
  assert.equal((await get('/account/settings', { cookie: customerCookie })).status, 200);
  const contact = await get('/api/account/contact', {
    cookie: customerCookie,
    body: { name: '담당자', phone: '010-1234-5678', consent: true },
  });
  assert.equal(contact.status, 200);
  assert.match(
    (await get('/account/settings', { cookie: await login('customer@local.invalid') })).body,
    /01012345678/,
  );
  const deniedSignup = await get('/api/auth/signup', {
    body: { email: 'without-consent@local.invalid', password },
  });
  assert.equal(deniedSignup.status, 400);
  const signup = await get('/api/auth/signup', {
    body: { email: 'new@local.invalid', password, acceptedTerms: true },
  });
  assert.equal(signup.status, 200);
  const newCookie = signup.headers['set-cookie']!.map((v) => v.split(';')[0]).join('; ');
  assert.equal(
    (await get('/account', { cookie: newCookie })).headers.location,
    '/account/settings',
  );
  assert.equal((await get('/terms')).status, 200);
  assert.equal((await get('/privacy')).status, 200);
  assert.equal((await get('/account', { cookie: customerCookie })).headers.location, '/dashboard');
  assert.equal((await get('/account', { cookie: adminCookie })).headers.location, '/admin');
  assert.equal((await get('/dashboard', { cookie: adminCookie })).headers.location, '/admin');
  assert.equal((await get('/admin', { cookie: customerCookie })).status, 404);
  assert.equal((await get('/admin', { cookie: adminCookie })).status, 200);
  assert.equal((await get('/dashboard', { cookie: customerCookie })).status, 200);
  assert.equal((await get('/login', { cookie: adminCookie })).headers.location, '/admin');
  assert.equal((await get('/login?mode=reset', { cookie: adminCookie })).status, 200);
  assert.equal((await get('/', { cookie: adminCookie })).status, 200);
  const tenant = await get('/', { host: 'customer.local.test' });
  assert.equal(tenant.status, 200);
  assert.match(tenant.body, /<title>Customer A<\/title>/);
  assert.doesNotMatch(tenant.body, /가게는 작아도/);
  for (const path of ['/', '/templates', '/admin', '/s/customer-a'])
    assert.equal((await get(path, { host: 'unknown.local.test' })).status, 404);
  assert.equal((await get('/templates', { host: 'customer.local.test' })).status, 404);
  assert.equal((await get('/template-preview/salon', { host: 'customer.local.test' })).status, 404);
  const sitemap = await get('/sitemap.xml');
  assert.match(sitemap.body, /<loc>http:\/\/127.0.0.1:3011\/guide<\/loc>/);
  assert.doesNotMatch(sitemap.body, /dashboard|admin|customer-a/);
  assert.doesNotMatch(sitemap.body, /template-preview/);
  assert.match(sitemap.body, /\/templates\/professional/);
  assert.match((await get('/robots.txt')).body, /Disallow: \/admin/);
  console.log(
    'PASS: public pages, template themes, assets, SEO, real local login, role routing, recovery access, tenant host isolation.',
  );
} finally {
  server.kill('SIGTERM');
  if (server.exitCode === null) await once(server, 'exit');
  await rm(dir, { recursive: true, force: true });
}
