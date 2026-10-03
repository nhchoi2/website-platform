'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/client';
import { emptyContent, type Content } from '@/lib/content';
import { templateCatalog } from '@/templates/catalog/catalog';
import { parseOptions } from '@/templates/catalog/options';
import type { Inquiry } from '@/lib/inquiries';
import type { Site } from '@/lib/types';
import type { Project } from '@/lib/projects';
export type CustomerChoice = {
  id: string;
  email: string;
  site_id: string | null;
  slug: string | null;
};
export function SiteSetup({
  customers = [],
  inquiry,
  admin = false,
}: {
  customers?: CustomerChoice[];
  inquiry?: Inquiry;
  admin?: boolean;
}) {
  const router = useRouter();
  const [template, setTemplate] = useState<Content['template']>(
      (inquiry?.selection.template as Content['template']) || 'hyehwa',
    ),
    [pages, setPages] = useState(1),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  return (
    <form
      className="panel setup-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        const f = new FormData(e.currentTarget);
        setBusy(true);
        setMessage('');
        try {
          const owner = admin ? String(f.get('customer')) : undefined;
          const options = inquiry
            ? parseOptions(Object.fromEntries(new URLSearchParams(inquiry.selection.query)))
            : {
                pages: pages as 1 | 3 | 4,
                nav: 'right' as const,
                mobileNav: 'hamburger' as const,
                features: [],
                links: {},
              };
          const content: Content = {
            ...emptyContent(),
            template,
            layout: 'catalog',
            options: {
              ...options,
              nav: options.nav || 'right',
              mobileNav: options.mobileNav || 'hamburger',
              links: options.links,
            },
            name: String(f.get('name') || ''),
          };
          const site = await post<Site>('/api/sites', {
            owner,
            slug: f.get('slug'),
            template,
            content,
          });
          if (owner) {
            const project = await post<Project>('/api/projects', {
              customer: owner,
              inquiry: inquiry?.id || null,
              site: site.id,
            });
            router.push(`/admin/projects/${project.id}`);
          } else router.push('/dashboard');
          router.refresh();
        } catch (err) {
          setMessage((err as Error).message);
          setBusy(false);
        }
      }}
    >
      <h2>{admin ? '고객 홈페이지 제작 시작' : '홈페이지 초안 만들기'}</h2>
      <p>
        {admin
          ? '가입 고객을 선택하면 고객이 관리할 홈페이지와 제작 진행 화면이 연결됩니다.'
          : '초안을 만들거나 먼저 제작 상담을 요청할 수 있습니다. 생성만으로 공개되지 않습니다.'}
      </p>
      <fieldset disabled={busy}>
        {admin && (
          <label>
            고객 계정
            <select name="customer" required defaultValue={inquiry?.customer_id || ''}>
              <option value="">고객 선택</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.email}
                  {c.site_id ? ' · 기존 홈페이지 연결' : ''}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          디자인
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as Content['template'])}
          >
            {templateCatalog.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <a href={`/templates/${template}`} target="_blank" rel="noreferrer">
          선택 디자인 확인 ↗
        </a>
        {!inquiry && (
          <label>
            페이지 구성
            <select value={pages} onChange={(e) => setPages(Number(e.target.value))}>
              <option value={1}>원페이지</option>
              <option value={3}>3페이지</option>
              <option value={4}>4페이지</option>
            </select>
          </label>
        )}
        <label>
          매장·업체 이름
          <input name="name" maxLength={80} defaultValue={inquiry?.business || ''} />
        </label>
        <label>
          테스트 주소
          <input
            name="slug"
            required
            pattern="[a-z0-9][a-z0-9-]{2,39}"
            minLength={3}
            maxLength={40}
            placeholder="my-business"
          />
        </label>
        <p>영문 소문자·숫자·하이픈 3~40자. 공개 주소는 /s/입력한주소입니다.</p>
        <button className="button primary">{busy ? '생성 중…' : '홈페이지 초안 만들기 →'}</button>
      </fieldset>
      <p role="status">{message}</p>
    </form>
  );
}
