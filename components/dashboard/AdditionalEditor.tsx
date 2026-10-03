'use client';
import type { Content } from '@/lib/content';
import type { Asset } from '@/lib/types';
import { featureOptions } from '@/templates/catalog/options';
import { templateCatalog } from '@/templates/catalog/catalog';
import { post } from '@/lib/client';
import { useState } from 'react';
export function AdditionalEditor({
  content: c,
  update,
  siteId,
  assets,
  onAsset,
}: {
  content: Content;
  update: (c: Content | ((current: Content) => Content)) => void;
  siteId: string;
  assets: Asset[];
  onAsset: (a: Asset) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const options = c.options || {
    pages: 1,
    nav: 'right',
    mobileNav: 'hamburger',
    features: [],
    links: {},
  };
  const field = (name: keyof Content, value: unknown) =>
    update((current) => ({
      ...current,
      layout: 'catalog',
      options: current.options || options,
      [name]: value,
    }));
  async function upload(file: File, done: (a: Asset) => void) {
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.set('file', file);
      const asset = await post<Asset>(`/api/sites/${siteId}/upload`, form);
      onAsset(asset);
      done(asset);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const imageChoice = (
    label: string,
    value: string | null | undefined,
    onChange: (id: string | null) => void,
  ) => (
    <label>
      {label}
      <select value={value || ''} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">사용 안 함</option>
        {assets
          .filter((a) => a.mime !== 'application/pdf')
          .map((a) => (
            <option key={a.id} value={a.id}>
              {a.original_name}
            </option>
          ))}
      </select>
      <input
        aria-label={`${label} 업로드`}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f, (a) => onChange(a.id));
        }}
      />
    </label>
  );
  return (
    <div className="additional-editor">
      <h2>페이지·기능 설정</h2>
      <p>
        변경 사항은 초안에 저장됩니다. 추가 페이지·유료 기능은 운영자와 비용을 협의한 뒤
        승인·게시합니다.
      </p>
      <div className="form-grid">
        <label>
          디자인
          <select
            value={c.template}
            onChange={(e) =>
              update({
                ...c,
                template: e.target.value as Content['template'],
                layout: 'catalog',
                options,
              })
            }
          >
            {templateCatalog.map((t) => (
              <option value={t.slug} key={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          페이지 수
          <select
            value={options.pages}
            onChange={(e) =>
              update({
                ...c,
                layout: 'catalog',
                options: { ...options, pages: Number(e.target.value) as 1 | 3 | 4 },
              })
            }
          >
            {[1, 3, 4].map((x) => (
              <option key={x} value={x}>
                {x === 1 ? '원페이지' : `${x}페이지`}
              </option>
            ))}
          </select>
        </label>
        <label>
          메뉴 위치
          <select
            value={options.nav}
            onChange={(e) => field('options', { ...options, nav: e.target.value })}
          >
            <option value="left">왼쪽</option>
            <option value="center">가운데</option>
            <option value="right">오른쪽</option>
          </select>
        </label>
        <label>
          모바일 메뉴
          <select
            value={options.mobileNav}
            onChange={(e) => field('options', { ...options, mobileNav: e.target.value })}
          >
            <option value="expanded">펼치기</option>
            <option value="hamburger">메뉴 버튼</option>
          </select>
        </label>
      </div>
      <label>
        메뉴·서비스 영역 제목
        <input
          maxLength={60}
          value={c.serviceLabel || ''}
          placeholder="메뉴·서비스"
          onChange={(e) => field('serviceLabel', e.target.value)}
        />
      </label>
      <div className="feature-options">
        {featureOptions.map((f) => (
          <label className="consent-row" key={f.id}>
            <input
              type="checkbox"
              checked={options.features.includes(f.id)}
              onChange={(e) =>
                update({
                  ...c,
                  layout: 'catalog',
                  options: {
                    ...options,
                    features: e.target.checked
                      ? [...options.features, f.id]
                      : options.features.filter((x) => x !== f.id),
                  },
                })
              }
            />
            {f.label} · {f.cost === 'paid' ? '추가 견적' : '기본 포함'}
          </label>
        ))}
      </div>
      {(['consult', 'reserve', 'place', 'kakao'] as const)
        .filter((f) => options.features.includes(f))
        .map((f) => (
          <label key={f}>
            {featureOptions.find((x) => x.id === f)?.label} 연결 주소
            <input
              type="url"
              maxLength={500}
              placeholder="https://"
              value={options.links[f] || ''}
              onChange={(e) => {
                const links = { ...options.links };
                if (e.target.value) links[f] = e.target.value;
                else delete links[f];
                field('options', { ...options, links });
              }}
            />
          </label>
        ))}
      <label className="consent-row">
        <input
          type="checkbox"
          checked={!c.customTheme}
          onChange={(e) => field('customTheme', !e.target.checked)}
        />
        템플릿 기본 색상 사용
      </label>
      <h3>로고와 브라우저 탭 아이콘</h3>
      <p>정사각형 사진을 탭 아이콘으로 권장합니다. 새 파일로 교체해도 기존 공개본은 유지됩니다.</p>
      {imageChoice('로고', c.logoId, (id) => field('logoId', id))}
      {imageChoice('브라우저 탭 아이콘', c.iconId, (id) => field('iconId', id))}
      <label>
        상단 안내 배너
        <input
          value={c.notice || ''}
          maxLength={300}
          onChange={(e) => field('notice', e.target.value)}
        />
      </label>
      <label>
        휴무·주차 안내
        <textarea
          value={c.parking || ''}
          maxLength={500}
          onChange={(e) => field('parking', e.target.value)}
        />
      </label>
      <h3>지도</h3>
      <label className="consent-row">
        <input
          type="checkbox"
          checked={c.map?.enabled || false}
          onChange={(e) =>
            field('map', { enabled: e.target.checked, query: c.map?.query || c.address })
          }
        />
        Google 지도 표시
      </label>
      <p className="help">
        운영자가 지도 API 키와 고객 도메인을 설정한 뒤 실제 지도가 표시됩니다. 미연결 상태에서는
        주소만 표시합니다.
      </p>
      {c.map?.enabled && (
        <label>
          지도에서 찾을 주소·장소
          <input
            maxLength={500}
            value={c.map.query}
            onChange={(e) => field('map', { ...c.map, query: e.target.value })}
          />
        </label>
      )}
      {error && <p role="alert">{error}</p>}
      <h3>담당자 소개</h3>
      {(c.team || []).map((x, i) => (
        <div className="panel" key={x.id}>
          <label>
            이름
            <input
              maxLength={80}
              value={x.name}
              onChange={(e) =>
                field(
                  'team',
                  c.team?.map((t, j) => (j === i ? { ...t, name: e.target.value } : t)),
                )
              }
            />
          </label>
          <label>
            역할·소개
            <input
              maxLength={200}
              value={x.role}
              onChange={(e) =>
                field(
                  'team',
                  c.team?.map((t, j) => (j === i ? { ...t, role: e.target.value } : t)),
                )
              }
            />
          </label>
          {imageChoice('담당자 사진', x.imageId, (id) =>
            field(
              'team',
              c.team?.map((t, j) => (j === i ? { ...t, imageId: id } : t)),
            ),
          )}
          <button
            className="text-button"
            onClick={() =>
              field(
                'team',
                c.team?.filter((t) => t.id !== x.id),
              )
            }
          >
            담당자 삭제
          </button>
        </div>
      ))}
      <button
        className="button secondary"
        disabled={(c.team?.length || 0) >= 20}
        onClick={() =>
          field('team', [
            ...(c.team || []),
            { id: crypto.randomUUID(), name: '', role: '', imageId: null },
          ])
        }
      >
        담당자 추가
      </button>
      <h3>요일별 시간표</h3>
      {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
        <label key={day}>
          {day}요일
          <input
            value={c.schedule?.find((x) => x.day === day)?.hours || ''}
            maxLength={200}
            onChange={(e) =>
              field(
                'schedule',
                [
                  ...(c.schedule || []).filter((x) => x.day !== day),
                  { day, hours: e.target.value },
                ].sort(
                  (a, b) =>
                    ['월', '화', '수', '목', '금', '토', '일'].indexOf(a.day) -
                    ['월', '화', '수', '목', '금', '토', '일'].indexOf(b.day),
                ),
              )
            }
          />
        </label>
      ))}
      <h3>자주 묻는 질문</h3>
      {(c.faq || []).map((x, i) => (
        <div className="panel" key={x.id}>
          <label>
            질문
            <input
              value={x.question}
              maxLength={200}
              onChange={(e) =>
                field(
                  'faq',
                  c.faq?.map((t, j) => (j === i ? { ...t, question: e.target.value } : t)),
                )
              }
            />
          </label>
          <label>
            답변
            <textarea
              value={x.answer}
              maxLength={2000}
              onChange={(e) =>
                field(
                  'faq',
                  c.faq?.map((t, j) => (j === i ? { ...t, answer: e.target.value } : t)),
                )
              }
            />
          </label>
          <button
            className="text-button"
            onClick={() =>
              field(
                'faq',
                c.faq?.filter((t) => t.id !== x.id),
              )
            }
          >
            질문 삭제
          </button>
        </div>
      ))}
      <button
        className="button secondary"
        disabled={(c.faq?.length || 0) >= 30}
        onClick={() =>
          field('faq', [...(c.faq || []), { id: crypto.randomUUID(), question: '', answer: '' }])
        }
      >
        질문 추가
      </button>
      <h3>이용 절차</h3>
      {(c.process || []).map((x, i) => (
        <div className="panel" key={x.id}>
          <label>
            단계 이름
            <input
              value={x.title}
              maxLength={80}
              onChange={(e) =>
                field(
                  'process',
                  c.process?.map((t, j) => (j === i ? { ...t, title: e.target.value } : t)),
                )
              }
            />
          </label>
          <label>
            설명
            <textarea
              value={x.description}
              maxLength={500}
              onChange={(e) =>
                field(
                  'process',
                  c.process?.map((t, j) => (j === i ? { ...t, description: e.target.value } : t)),
                )
              }
            />
          </label>
          <button
            className="text-button"
            onClick={() =>
              field(
                'process',
                c.process?.filter((t) => t.id !== x.id),
              )
            }
          >
            단계 삭제
          </button>
        </div>
      ))}
      <button
        className="button secondary"
        disabled={(c.process?.length || 0) >= 10}
        onClick={() =>
          field('process', [
            ...(c.process || []),
            { id: crypto.randomUUID(), title: '', description: '' },
          ])
        }
      >
        단계 추가
      </button>
    </div>
  );
}
