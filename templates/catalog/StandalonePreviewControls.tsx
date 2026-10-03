'use client';

import { useSyncExternalStore, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { templateCatalog, type Template } from './catalog';
import {
  demoPages,
  featureOptions,
  inquiryHref,
  optionsQuery,
  previewHref,
  safeExternalLink,
  type DemoPage,
  type FeatureId,
  type PageCount,
  type PreviewOptions,
} from './options';
import './preview-controls.css';

const subscribe = () => () => {};
const standalone = () => window.parent === window;
const serverSnapshot = () => false;

// The embedded preview uses its parent's configurator; a separate tab needs its own controls.
export function StandalonePreviewControls({
  template,
  options,
  page,
}: {
  template: Template;
  options: PreviewOptions;
  page: DemoPage;
}) {
  const visible = useSyncExternalStore(subscribe, standalone, serverSnapshot);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (!visible) return null;

  function change(next: PreviewOptions) {
    const validPage =
      next.pages === 1 || !demoPages(next.pages, template).some((x) => x.id === page)
        ? 'home'
        : page;
    startTransition(() =>
      router.replace(previewHref(template.slug, validPage, next), { scroll: false }),
    );
  }
  function toggle(id: FeatureId, checked: boolean) {
    change({
      ...options,
      features: checked
        ? featureOptions
            .filter((x) => x.id === id || options.features.includes(x.id))
            .map((x) => x.id)
        : options.features.filter((x) => x !== id),
    });
  }

  return (
    <aside className="sp-controls" aria-label="별도 창 미리보기 설정">
      <div className="sp-summary">
        <Link href={`/templates/${template.slug}?${optionsQuery(options)}`}>← 상세보기</Link>
        <span>
          {options.pages === 1 ? '원페이지' : `${options.pages}페이지`} · 기능{' '}
          {options.features.length}개
        </span>
      </div>
      <details className="sp-settings">
        <summary>미리보기 설정</summary>
        <div className="sp-panel">
          <p>
            <strong>{template.name}</strong>
            <br />
            선택하면 현재 미리보기에 적용됩니다.
          </p>
          <fieldset disabled={pending}>
            <legend>페이지·콘텐츠 구성</legend>
            <label>
              페이지 구성
              <select
                value={options.pages}
                onChange={(e) => change({ ...options, pages: Number(e.target.value) as PageCount })}
              >
                <option value={1}>원페이지 · 섹션 이동</option>
                <option value={3}>3페이지 · 홈·소개 / 서비스 / 방문</option>
                <option value={4}>4페이지 · 홈 / 소개 / 서비스 / 방문</option>
              </select>
            </label>
            <label>
              예시 콘텐츠 업종
              <select
                value={options.business || template.slug}
                onChange={(e) => change({ ...options, business: e.target.value })}
              >
                {templateCatalog.map((x) => (
                  <option key={x.slug} value={x.slug}>
                    {x.industry}
                  </option>
                ))}
              </select>
            </label>
            {[
              {
                title: '콘텐츠 기능',
                choices: featureOptions.filter((x) => !x.floating && x.id !== 'notice'),
              },
              {
                title: '안내·외부 연결',
                choices: featureOptions.filter((x) => x.floating || x.id === 'notice'),
              },
            ].map((group) => (
              <div className="sp-feature-group" key={group.title}>
                <h2>{group.title}</h2>
                {group.choices.map((feature) => (
                  <div key={feature.id}>
                    <label className="sp-feature">
                      <input
                        type="checkbox"
                        checked={options.features.includes(feature.id)}
                        onChange={(e) => toggle(feature.id, e.target.checked)}
                      />
                      <span>
                        <strong>{feature.label}</strong>
                        <small>{feature.description}</small>
                      </span>
                    </label>
                    {feature.floating &&
                      feature.id !== 'top' &&
                      options.features.includes(feature.id) && (
                        <label className="sp-link-input">
                          {feature.label} 연결 주소
                          <input
                            type="url"
                            placeholder="https://…"
                            defaultValue={options.links[feature.id] || ''}
                            key={options.links[feature.id] || 'empty'}
                            onBlur={(e) => {
                              const value = e.target.value.trim();
                              if (value && !safeExternalLink(value)) {
                                e.target.setCustomValidity(
                                  'https://로 시작하는 올바른 주소를 입력해 주세요.',
                                );
                                e.target.reportValidity();
                                return;
                              }
                              if (value !== (options.links[feature.id] || ''))
                                change({
                                  ...options,
                                  links: { ...options.links, [feature.id]: value },
                                });
                            }}
                            onInput={(e) => e.currentTarget.setCustomValidity('')}
                          />
                        </label>
                      )}
                  </div>
                ))}
              </div>
            ))}
          </fieldset>
          <p role="status">
            {pending
              ? '미리보기에 적용 중…'
              : '선택 내용은 주소에 저장되며, 페이지 이동·새로고침 후 유지됩니다.'}
          </p>
          <p>
            설정을 닫고 사이트 메뉴로 페이지를 이동하세요. 추가 페이지·기능 비용은 상담 후
            확정합니다.
          </p>
          <a className="sp-inquiry" href={inquiryHref(template, options)}>
            이 구성으로 제작 문의 ↗
          </a>
        </div>
      </details>
    </aside>
  );
}
