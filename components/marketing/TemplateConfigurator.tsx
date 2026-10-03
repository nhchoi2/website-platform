'use client';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import type { Template } from '@/templates/catalog/catalog';
import {
  featureOptions,
  demoPages,
  optionsQuery,
  previewHref,
  safeExternalLink,
  inquiryHref,
  quoteSummary,
  type PreviewOptions,
  type PageCount,
  type DemoPage,
} from '@/templates/catalog/options';
import { formatWon, pricing } from './content';
import './templates.css';

export function TemplateConfigurator({
  template,
  initial,
}: {
  template: Template;
  initial: PreviewOptions;
}) {
  const [options, setOptions] = useState(initial);
  const [page, setPage] = useState<DemoPage>('home');
  const [device, setDevice] = useState('desktop');
  const [copied, setCopied] = useState('');
  const frame = useRef<HTMLIFrameElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(760);
  const desktopScale = Math.min(canvasWidth / 1080, 1);
  const choices = demoPages(options.pages, template);
  const currentPage =
    options.pages === 1 || !choices.some((choice) => choice.id === page) ? 'home' : page;
  const src = previewHref(template.slug, currentPage, options);
  const quote = quoteSummary(options);
  useEffect(() => {
    if (!canvas.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setCanvasWidth(Math.max(entry.contentRect.width, 1)),
    );
    observer.observe(canvas.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const query = optionsQuery(options);
    window.history.replaceState(null, '', `${window.location.pathname}?${query}`);
  }, [options]);
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.type !== 'koofy-template-page' ||
        event.data.slug !== template.slug
      )
        return;
      if (demoPages(options.pages, template).some((choice) => choice.id === event.data.page))
        setPage(event.data.page);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [template, options.pages]);
  async function copySelection() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied('선택한 구성의 링크를 복사했습니다.');
    } catch {
      setCopied('브라우저 주소창의 주소를 복사해 주세요. 선택 내용이 주소에 포함되어 있습니다.');
    }
  }
  return (
    <div className="m-configurator">
      <aside className="m-config-options" aria-label="템플릿 구성 선택">
        <fieldset>
          <legend>01 · 페이지 구성</legend>
          <div className="m-page-choices">
            {([1, 3, 4] as PageCount[]).map((count) => (
              <label key={count}>
                <input
                  type="radio"
                  name="pages"
                  checked={options.pages === count}
                  onChange={() => {
                    setOptions({ ...options, pages: count });
                    setPage('home');
                  }}
                />
                <span>
                  <strong>{count === 1 ? '원페이지' : `${count}페이지`}</strong>
                  <small>
                    {count === 1
                      ? '메뉴 클릭 → 같은 페이지의 섹션'
                      : count === 3
                        ? `홈·소개 / ${template.serviceLabel} / 방문·문의`
                        : `홈 / 소개 / ${template.serviceLabel} / 방문·문의`}
                  </small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>02 · 추가 기능 미리보기</legend>
          {featureOptions.map((feature) => (
            <div className="m-feature-choice" key={feature.id}>
              <label>
                <input
                  type="checkbox"
                  checked={options.features.includes(feature.id)}
                  onChange={(event) =>
                    setOptions({
                      ...options,
                      features: event.target.checked
                        ? [...options.features, feature.id]
                        : options.features.filter((id) => id !== feature.id),
                    })
                  }
                />
                <span>
                  <strong>{feature.label}</strong>
                  <small>{feature.description}</small>
                </span>
              </label>
              {feature.floating &&
                feature.id !== 'top' &&
                options.features.includes(feature.id) && (
                  <label className="m-link-input">
                    <span>{feature.label} 연결 주소 (선택)</span>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={options.links[feature.id] || ''}
                      onChange={(event) =>
                        setOptions({
                          ...options,
                          links: { ...options.links, [feature.id]: event.target.value },
                        })
                      }
                      aria-invalid={
                        !!options.links[feature.id] && !safeExternalLink(options.links[feature.id]!)
                      }
                    />
                    {!!options.links[feature.id] &&
                      !safeExternalLink(options.links[feature.id]!) && (
                        <small className="m-input-error">
                          HTTPS 주소를 입력하세요. 연결 전에는 예시 안내만 표시합니다.
                        </small>
                      )}
                  </label>
                )}
            </div>
          ))}
        </fieldset>
        <div className="m-config-quote" aria-live="polite">
          <p>기본 원페이지 제작</p>
          <strong>
            {formatWon(quote.base)} <small>부터 · 부가세 포함</small>
          </strong>
          <p>
            {quote.needsQuote
              ? '선택한 구성의 최종 금액은 상담 후 확정합니다. 추가 페이지·기능 요금은 아직 미정입니다.'
              : '기본 구성 기준 예상 금액입니다. 최종 견적은 상담 후 확정합니다.'}
          </p>
          <small>
            운영·관리 월 {formatWon(pricing.monthly)}부터 · 기본 호스팅 포함 · 도메인 별도
          </small>
          <a className="m-button" href={inquiryHref(template, options)}>
            이 구성으로 제작 문의 ↗
          </a>
          <small>메일 앱에 선택 내용을 넣습니다. 직접 발송해야 문의가 전달됩니다.</small>
          <button className="m-copy-selection" onClick={copySelection}>
            선택한 구성 링크 복사
          </button>
          <p role="status">{copied}</p>
        </div>
      </aside>
      <a className="m-mobile-preview-jump" href="#selected-template-preview">
        선택한 기능 미리보기 ↓
      </a>
      <section
        id="selected-template-preview"
        className="m-preview-area"
        aria-label="선택한 템플릿 미리보기"
      >
        <div className="m-config-toolbar">
          <div>
            <strong>실제 화면 미리보기</strong>
            <small>
              {options.pages === 1
                ? '원페이지 · 메뉴로 섹션 이동'
                : `${options.pages}개 독립 페이지 · 메뉴로 페이지 이동`}
            </small>
          </div>
          <div className="m-device-choices">
            {[
              ['desktop', '데스크톱'],
              ['mobile', '모바일'],
            ].map(([value, label]) => (
              <button key={value} aria-pressed={device === value} onClick={() => setDevice(value)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {options.pages !== 1 && (
          <nav className="m-preview-page-tabs" aria-label="미리보기 페이지 선택">
            {choices.map((choice) => (
              <button
                key={choice.id}
                aria-current={currentPage === choice.id ? 'page' : undefined}
                onClick={() => setPage(choice.id)}
              >
                {choice.label}
              </button>
            ))}
          </nav>
        )}
        <div
          ref={canvas}
          className={`m-template-viewport ${device === 'mobile' ? 'is-mobile' : ''}`}
        >
          <iframe
            ref={frame}
            src={src}
            title={`${template.name} ${currentPage} 미리보기`}
            style={
              device === 'desktop'
                ? {
                    width: 1080,
                    height: 680 / desktopScale,
                    transform: `scale(${desktopScale})`,
                    transformOrigin: 'top left',
                  }
                : undefined
            }
          />
        </div>
        <div className="m-preview-footnote">
          <p>
            체크한 기능은 모든 예시 페이지에 유지됩니다. 링크를 입력하지 않은 버튼은 예시 안내를
            보여줍니다.
          </p>
          <Link href={src} target="_blank" rel="noopener noreferrer">
            새 창에서 전체 화면 보기 ↗
          </Link>
        </div>
        <noscript>
          기능 선택에는 JavaScript가 필요합니다. <a href={src}>기본 예시 사이트 보기</a>
        </noscript>
      </section>
    </div>
  );
}
