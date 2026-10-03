'use client';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { demoContent, templateCatalog, type Template } from '@/templates/catalog/catalog';
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
  const [focusFeature, setFocusFeature] = useState('');
  const frame = useRef<HTMLIFrameElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(760);
  const desktopScale = Math.min(canvasWidth / 1080, 1);
  const content = demoContent(template, options.business);
  const choices = demoPages(options.pages, content);
  const currentPage =
    options.pages === 1 || !choices.some((choice) => choice.id === page) ? 'home' : page;
  const selectedAnchor =
    focusFeature === 'faq' ? 'visit' : focusFeature ? `feature-${focusFeature}` : '';
  const src =
    previewHref(template.slug, currentPage, options) + (selectedAnchor ? `#${selectedAnchor}` : '');
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
      if (demoPages(options.pages, template).some((choice) => choice.id === event.data.page)) {
        if (event.data.page !== page) setFocusFeature('');
        setPage(event.data.page);
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [template, options.pages, page]);
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
        <div className="m-business-choice">
          <label htmlFor="sample-business">예시 콘텐츠 업종</label>
          <select
            id="sample-business"
            value={options.business || template.slug}
            onChange={(event) => {
              setOptions({ ...options, business: event.target.value });
              setPage('home');
              setFocusFeature('');
            }}
          >
            {templateCatalog.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.industry}
              </option>
            ))}
          </select>
          <p>
            디자인은 그대로, 예시 내용만 바뀝니다. 내 업종에 추천되지 않은 디자인도 선택할 수
            있습니다.
          </p>
        </div>
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
                    setFocusFeature('');
                  }}
                />
                <span>
                  <strong>{count === 1 ? '원페이지' : `${count}페이지`}</strong>
                  <small>
                    {count === 1
                      ? '메뉴 클릭 → 같은 페이지의 섹션'
                      : count === 3
                        ? `홈·소개 / ${content.serviceLabel} / 방문·문의`
                        : `홈 / 소개 / ${content.serviceLabel} / 방문·문의`}
                  </small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>02 · 기본 디자인 · 추가 비용 없음</legend>
          <p className="m-option-note">
            반응형 화면과 기본 검색 설정은 포함됩니다. 로고·브라우저 탭 아이콘은 제공한 파일을 제작
            시 적용합니다. 새 로고 디자인은 별도입니다.
          </p>
          <label className="m-basic-design-choice">
            메뉴 위치
            <select
              value={options.nav || 'right'}
              onChange={(e) =>
                setOptions({ ...options, nav: e.target.value as PreviewOptions['nav'] })
              }
            >
              <option value="left">왼쪽 · 상호 옆</option>
              <option value="center">가운데</option>
              <option value="right">오른쪽</option>
            </select>
          </label>
          <label className="m-basic-design-choice">
            모바일 메뉴
            <select
              value={options.mobileNav || 'expanded'}
              onChange={(e) =>
                setOptions({ ...options, mobileNav: e.target.value as PreviewOptions['mobileNav'] })
              }
            >
              <option value="expanded">메뉴 펼쳐보기</option>
              <option value="hamburger">메뉴 버튼으로 열기</option>
            </select>
          </label>
        </fieldset>
        {[
          { title: '03 · 무료 선택 · 기본 제작비 포함', cost: 'included' },
          { title: '04 · 유료 추가 · 상담 후 견적', cost: 'paid' },
        ].map((group) => (
          <fieldset key={group.title}>
            <legend>{group.title}</legend>
            {featureOptions
              .filter((feature) => feature.cost === group.cost)
              .map((feature) => (
                <div className="m-feature-choice" key={feature.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={options.features.includes(feature.id)}
                      onChange={(event) => {
                        setFocusFeature(
                          event.target.checked && !feature.floating && feature.id !== 'notice'
                            ? feature.id
                            : '',
                        );
                        if (event.target.checked && feature.id === 'faq' && options.pages !== 1)
                          setPage('visit');
                        setOptions({
                          ...options,
                          features: event.target.checked
                            ? [...options.features, feature.id]
                            : options.features.filter((id) => id !== feature.id),
                        });
                      }}
                    />
                    <span>
                      <strong>
                        {feature.label}{' '}
                        <small className="m-option-cost">
                          {feature.cost === 'included' ? '기본 포함' : '유료 추가'}
                        </small>
                      </strong>
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
                            !!options.links[feature.id] &&
                            !safeExternalLink(options.links[feature.id]!)
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
        ))}
        <div className="m-config-quote" aria-live="polite">
          <p>기본 원페이지 제작</p>
          <strong>
            {formatWon(quote.base)} <small>부터 · 부가세 포함</small>
          </strong>
          <p>
            {quote.needsQuote
              ? '선택한 구성의 최종 금액은 상담 후 확정합니다. 추가 페이지·기능 요금은 아직 미정입니다.'
              : '선택한 기본 항목과 메뉴 배치는 추가 비용이 없습니다. 최종 제작 범위는 상담으로 확인합니다.'}
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
                onClick={() => {
                  setPage(choice.id);
                  setFocusFeature('');
                }}
              >
                {choice.label}
              </button>
            ))}
          </nav>
        )}
        {!!options.features.length && (
          <nav className="m-preview-features" aria-label="추가한 콘텐츠 바로 보기">
            {featureOptions
              .filter((f) => !f.floating && f.id !== 'notice' && options.features.includes(f.id))
              .map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFocusFeature(f.id);
                    if (f.id === 'faq' && options.pages !== 1) setPage('visit');
                  }}
                >
                  {f.label} ↓
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
            체크한 기능은 모든 예시 페이지에 유지됩니다. 콘텐츠 기능은 화면 아래에 추가됩니다. FAQ는
            방문 안내에 표시됩니다. 링크를 입력하지 않은 버튼은 예시 안내를 보여줍니다.
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
