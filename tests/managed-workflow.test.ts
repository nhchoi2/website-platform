import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { PGlite } from '@electric-sql/pglite';
import { createLocalDatabase, localRpc } from '../lib/local/database';
import { localRegister } from '../lib/local/auth';
import { emptyContent, contentSchema, assetIds, contentDiff } from '../lib/content';
import { templateCatalog } from '../templates/catalog/catalog';
import type { Site, Submission, Asset } from '../lib/types';
import type { Project, ProjectDetail, ProjectFile, Evidence } from '../lib/projects';
import { evidenceSchema } from '../lib/projects';
let db: PGlite,
  dir: string,
  a: string,
  b: string,
  admin: string,
  site: Site,
  project: Project,
  inquiry: string;
const call = <T>(user: string | null, name: string, args: Record<string, unknown> = {}) =>
  localRpc<T>(db, user, name, args);
async function service<T>(name: string, values: unknown[]) {
  return db.transaction(async (tx) => {
    await tx.exec('set local role service_role');
    const r = await tx.query<{ result: T }>(
      `select ${name}(${values.map((_, i) => `$${i + 1}`).join(',')}) as result`,
      values.map((x) => (typeof x === 'object' && x !== null ? JSON.stringify(x) : x)),
    );
    return r.rows[0].result;
  });
}
before(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), 'managed-tests-'));
  db = await createLocalDatabase(dir);
  a = await localRegister(db, 'managed-a@test.invalid', 'password-for-a-123');
  b = await localRegister(db, 'managed-b@test.invalid', 'password-for-b-123');
  admin = await localRegister(db, 'managed-admin@test.invalid', 'password-for-admin-123');
  await db.query('insert into admin_users values($1)', [admin]);
});
after(async () => {
  await db?.close();
  if (dir) await rm(dir, { recursive: true, force: true });
});
test('operator creates all seven customer designs; ordinary user cannot assign a site', async () => {
  for (const t of templateCatalog) {
    const owner =
      t.slug === 'cafe'
        ? a
        : await localRegister(db, `${t.slug}@test.invalid`, 'password-test-123');
    const content = contentSchema.parse({
      ...emptyContent(),
      template: t.slug,
      layout: 'catalog',
      name: `실제 ${t.slug}`,
      address: '서울',
      phone: '02-123-1234',
      options: {
        pages: 4,
        nav: 'center',
        mobileNav: 'hamburger',
        features: ['news', 'gallery'],
        links: {},
      },
      posts: [
        {
          id: randomUUID(),
          title: '실제 공지',
          body: '실제 공지 내용입니다.',
          date: '2026-10-03',
          attachments: [],
        },
      ],
    });
    const created = await call<Site>(admin, 'create_customer_site', {
      p_owner: owner,
      p_slug: `managed-${t.slug}`,
      p_content: content,
    });
    assert.equal(created.owner_id, owner);
    assert.equal(created.draft.template, t.slug);
    if (t.slug === 'cafe') site = created;
  }
  await assert.rejects(
    call(a, 'create_customer_site', {
      p_owner: b,
      p_slug: 'stolen-site',
      p_content: emptyContent(),
    }),
    /FORBIDDEN/,
  );
  const again = await call<Site>(admin, 'create_customer_site', {
    p_owner: a,
    p_slug: 'unused-address',
    p_content: emptyContent(),
  });
  assert.equal(again.id, site.id);
});
test('direct database saves reject malformed feature content without relying on the UI', async () => {
  const invalid = [
    { team: [{ id: randomUUID(), name: 42, role: '', imageId: null }] },
    { schedule: Array.from({ length: 8 }, () => ({ day: '월', hours: '09:00' })) },
    { faq: [{ id: randomUUID(), question: '문의', answer: false }] },
    { process: [{ id: randomUUID(), title: '상담', description: [] }] },
    { customTheme: 'true' },
  ];
  for (const fields of invalid) {
    await assert.rejects(
      call(a, 'save_draft', {
        p_site: site.id,
        p_expected: site.draft_version,
        p_content: { ...site.draft, ...fields },
      }),
      /INVALID_CONTENT/,
    );
  }
});
test('operator edit and freeze preserve original customer and reviewed multi-page content', async () => {
  const saved = await call<Site>(admin, 'save_draft', {
    p_site: site.id,
    p_expected: site.draft_version,
    p_content: { ...site.draft, tagline: '확인된 제출본' },
  });
  site = saved;
  const sub = await call<Submission>(admin, 'submit_site', {
    p_site: site.id,
    p_expected: site.draft_version,
    p_key: randomUUID(),
  });
  const later = await call<Site>(a, 'save_draft', {
    p_site: site.id,
    p_expected: site.draft_version,
    p_content: { ...site.draft, tagline: '아직 승인되지 않은 초안' },
  });
  site = later;
  assert.equal(await call(null, 'get_public_site', { p_slug: site.slug, p_host: null }), null);
  await call(admin, 'review_submission', {
    p_site: site.id,
    p_submission: sub.id,
    p_revision: sub.revision_id,
    p_action: 'approve',
    p_feedback: '',
    p_key: randomUUID(),
  });
  const published = await call<{ content: typeof site.draft }>(null, 'get_public_site', {
    p_slug: site.slug,
    p_host: null,
  });
  assert.equal(published.content.tagline, '확인된 제출본');
  assert.equal(published.content.options?.pages, 4);
  assert.equal(published.content.posts?.[0].title, '실제 공지');
});
test('new asset slots are private before approval and reject cross-customer files or PDF logos', async () => {
  const logo = await call<Asset>(admin, 'register_asset', {
    p_site: site.id,
    p_id: randomUUID(),
    p_name: 'logo.png',
    p_bytes: 100,
  });
  const pdf = await call<Asset>(admin, 'register_document', {
    p_site: site.id,
    p_id: randomUUID(),
    p_name: 'notice.pdf',
    p_bytes: 100,
  });
  assert.equal(logo.owner_id, a);
  assert.equal(pdf.mime, 'application/pdf');
  await assert.rejects(
    call(b, 'register_document', {
      p_site: site.id,
      p_id: randomUUID(),
      p_name: 'foreign.pdf',
      p_bytes: 100,
    }),
    /FORBIDDEN/,
  );
  await assert.rejects(
    call(a, 'save_draft', {
      p_site: site.id,
      p_expected: site.draft_version,
      p_content: { ...site.draft, logoId: pdf.id },
    }),
    /INVALID_CONTENT/,
  );
  site = await call<Site>(a, 'save_draft', {
    p_site: site.id,
    p_expected: site.draft_version,
    p_content: {
      ...site.draft,
      logoId: logo.id,
      iconId: logo.id,
      posts: [
        {
          id: randomUUID(),
          title: 'PDF 공지',
          body: '첨부 문서입니다.',
          date: '2026-10-03',
          attachments: [pdf.id],
        },
      ],
    },
  });
  assert.ok(assetIds(site.draft).includes(pdf.id));
  assert.equal(await call(null, 'get_public_asset', { p_id: pdf.id, p_host: null }), null);
  assert.ok(contentDiff(null, site.draft).some((x) => x.key === 'logoId'));
});
test('saved inquiry retry creates one pair of notification jobs and only attached customer sees history', async () => {
  const key = randomUUID(),
    values = [
      key,
      '고객 이름',
      '실제 가게',
      'email',
      'managed-a@test.invalid',
      '테스트 상담 내용입니다.',
      {},
      'b'.repeat(64),
      'consultation-2026-10-03',
      a,
      'operator@test.invalid',
    ];
  inquiry = await service<string>('submit_notified_inquiry', values);
  assert.equal(await service('submit_notified_inquiry', values), inquiry);
  const jobs = await call<unknown[]>(admin, 'list_notifications');
  assert.equal(jobs.length, 2);
  assert.equal((await call<unknown[]>(a, 'get_my_inquiries')).length, 1);
  assert.equal((await call<unknown[]>(b, 'get_my_inquiries')).length, 0);
  const own = await call<Record<string, unknown>[]>(a, 'get_my_inquiries');
  assert.equal('notes' in own[0], false);
  assert.equal('key' in own[0], false);
  await assert.rejects(call(a, 'list_notifications'), /FORBIDDEN/);
  await db.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [a]);
    await tx.exec('set local role authenticated');
    assert.equal((await tx.query('select contact from inquiries')).rows.length, 1);
  });
  await assert.rejects(
    db.transaction(async (tx) => {
      await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [a]);
      await tx.exec('set local role authenticated');
      await tx.query('select notes from inquiries');
    }),
    /permission denied/,
  );
});
test('operator links consultation to production; duplication and foreign access are blocked', async () => {
  project = await call<Project>(admin, 'start_project', {
    p_inquiry: inquiry,
    p_customer: a,
    p_site: site.id,
  });
  assert.equal(
    (
      await call<Project>(admin, 'start_project', {
        p_inquiry: inquiry,
        p_customer: a,
        p_site: site.id,
      })
    ).id,
    project.id,
  );
  await assert.rejects(call(b, 'get_project', { p_project: project.id }), /FORBIDDEN/);
  await assert.rejects(
    call(a, 'start_project', { p_inquiry: inquiry, p_customer: a, p_site: site.id }),
    /FORBIDDEN/,
  );
  await assert.rejects(
    call(admin, 'start_project', { p_inquiry: inquiry, p_customer: b, p_site: site.id }),
    /FORBIDDEN/,
  );
});
test('versioned quote and progress create customer history and one notification per version', async () => {
  const args = {
    p_project: project.id,
    p_expected: project.version,
    p_stage: 'production',
    p_message: '자료를 받고 제작을 시작했습니다.',
    p_quote: {
      setup: 390000,
      monthly: 44000,
      extras: 100000,
      scope: '4페이지 및 공지 기능, 부가세 포함',
    },
  };
  project = await call<Project>(admin, 'update_project', args);
  await assert.rejects(call(admin, 'update_project', args), /VERSION_CONFLICT/);
  await assert.rejects(
    call(b, 'update_project', { ...args, p_expected: project.version }),
    /FORBIDDEN/,
  );
  const detail = await call<ProjectDetail>(a, 'get_project', { p_project: project.id });
  assert.equal(detail.events.length, 2);
  assert.equal(detail.project.quote.monthly, 44000);
  await call(a, 'see_project_quote', { p_project: project.id, p_expected: project.version });
  assert.ok(
    (await call<ProjectDetail>(a, 'get_project', { p_project: project.id })).project.quote_seen_at,
  );
  await assert.rejects(
    call(b, 'see_project_quote', { p_project: project.id, p_expected: project.version }),
    /VERSION_CONFLICT/,
  );
  assert.equal((await call<unknown[]>(admin, 'list_notifications')).length, 3);
});
test('private production files require consent and remain invisible to other customer and anonymous', async () => {
  const args = {
    p_project: project.id,
    p_id: randomUUID(),
    p_name: '자료.pdf',
    p_bytes: 200,
    p_mime: 'application/pdf',
    p_consent: true,
  };
  await assert.rejects(
    call(a, 'register_project_file', { ...args, p_consent: false }),
    /CONSENT_REQUIRED/,
  );
  const f = await call<ProjectFile>(a, 'register_project_file', args);
  assert.equal(
    (await call<ProjectDetail>(a, 'get_project', { p_project: project.id })).files[0].id,
    f.id,
  );
  await assert.rejects(
    call(b, 'remove_project_file', { p_project: project.id, p_file: f.id }),
    /FORBIDDEN/,
  );
  await db.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [b]);
    await tx.exec('set local role authenticated');
    assert.equal((await tx.query('select * from project_files')).rows.length, 0);
  });
  await call(admin, 'remove_project_file', { p_project: project.id, p_file: f.id });
  assert.equal(
    (await call<ProjectDetail>(a, 'get_project', { p_project: project.id })).files.length,
    0,
  );
});
test('evidence requests require explicit consent, owner access, duplicate key safety and actual reference to mark issued', async () => {
  assert.equal(
    evidenceSchema.safeParse({
      project: project.id,
      key: randomUUID(),
      kind: 'cash_personal',
      identifierType: 'phone',
      identifier: '010-1234-5678',
      name: '테스트',
      email: 'receipt@test.invalid',
      consent: true,
    }).success,
    true,
  );
  const args = {
    p_project: project.id,
    p_key: randomUUID(),
    p_kind: 'cash_personal',
    p_identifier: '01012345678',
    p_name: '테스트',
    p_email: 'receipt@test.invalid',
    p_type: 'phone',
    p_consent: true,
  };
  await assert.rejects(call(b, 'request_evidence', args), /FORBIDDEN/);
  await assert.rejects(
    call(a, 'request_evidence', { ...args, p_consent: false }),
    /CONSENT_REQUIRED/,
  );
  const id = await call<string>(a, 'request_evidence', args);
  assert.equal(await call(a, 'request_evidence', args), id);
  await assert.rejects(
    call(a, 'request_evidence', { ...args, p_email: 'another@test.invalid' }),
    /IDEMPOTENCY_CONFLICT/,
  );
  await assert.rejects(
    call(admin, 'update_evidence', {
      p_id: id,
      p_status: 'issued',
      p_reference: '',
      p_message: '',
    }),
    /INVALID_ACTION/,
  );
  await assert.rejects(
    call(a, 'update_evidence', {
      p_id: id,
      p_status: 'issued',
      p_reference: 'fake',
      p_message: '',
    }),
    /FORBIDDEN/,
  );
  await call(admin, 'update_evidence', {
    p_id: id,
    p_status: 'issued',
    p_reference: 'EXTERNAL-TEST-ONLY',
    p_message: '외부 발행 기록 테스트',
  });
  assert.equal((await call<Evidence[]>(a, 'list_evidence'))[0].status, 'issued');
  assert.equal((await call<unknown[]>(b, 'list_evidence')).length, 0);
  const withdrawn = await call<string>(a, 'request_evidence', { ...args, p_key: randomUUID() });
  await call(a, 'update_evidence', {
    p_id: withdrawn,
    p_status: 'withdrawn',
    p_reference: '',
    p_message: '',
  });
  const rows = await call<Evidence[]>(a, 'list_evidence');
  assert.equal(rows.find((x) => x.id === withdrawn)?.identifier, '0000000000');
});
test('outbox claims do not overlap and retries retain same provider idempotency identity', async () => {
  const [one, two] = await Promise.all([
    service<{ id: string }[]>('claim_notifications', [2]),
    service<{ id: string }[]>('claim_notifications', [2]),
  ]);
  assert.equal(one.length + two.length, 3);
  assert.ok(one.every((x) => !two.some((y) => y.id === x.id)));
  const first = one[0];
  await service('finish_notification', [first.id, 'unknown', null, 'TIMEOUT']);
  const retry = await service<{ id: string }[]>('claim_notifications', [10]);
  assert.equal(retry[0].id, first.id);
  await service('finish_notification', [first.id, 'sent', 'provider-test-id', '']);
  assert.equal((await service<unknown[]>('claim_notifications', [10])).length, 0);
});
test('progress and evidence records survive database restart', async () => {
  await db.close();
  db = await createLocalDatabase(dir);
  assert.equal(
    (await call<ProjectDetail>(a, 'get_project', { p_project: project.id })).project.quote.monthly,
    44000,
  );
  assert.equal((await call<Evidence[]>(a, 'list_evidence')).length, 2);
});
