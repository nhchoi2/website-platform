'use client';
import { useState } from 'react';
import { post } from '@/lib/client';
export function TemplatePicker() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="page-body">
      <p className="eyebrow">START YOUR STORY</p>
      <h1>우리 가게에 어울리는 시작</h1>
      <p className="muted">템플릿을 선택한 뒤 사진, 메뉴, 매장 정보를 채워주세요.</p>
      <div className="template-layout">
        <div className="template-card">
          <div className="template-thumbnail">
            <div className="thumb-header">
              우리의 식탁 <span>소개　메뉴　오시는 길</span>
            </div>
            <div className="thumb-hero">
              <div>
                <small>GOOD FOOD, WARM MOMENTS</small>
                <h2>
                  정성으로
                  <br />
                  차린 한 끼.
                </h2>
                <span className="thumb-button">메뉴 보기 ↗</span>
              </div>
              <div className="thumb-photo">
                <span>食</span>
              </div>
            </div>
            <div className="thumb-footer">맛있는 시간, 우리의 이야기 ──────</div>
          </div>
          <div className="template-caption">
            <div>
              <span className="pill green">선택됨</span>
              <h2>혜화 · 담백한 식탁</h2>
              <p>
                여백과 사진이 중심이 되는 차분한 디자인.
                <br />
                음식과 공간의 이야기를 자연스럽게 전합니다.
              </p>
            </div>
            <span className="template-number">01</span>
          </div>
        </div>
        <form
          className="panel setup-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            try {
              const data = new FormData(e.currentTarget);
              await post('/api/sites', { slug: data.get('slug'), template: 'hyehwa' });
              window.location.assign(new URL('/dashboard', window.location.origin).href);
            } catch (err) {
              setError((err as Error).message);
              setBusy(false);
            }
          }}
        >
          <p className="eyebrow">YOUR FIRST WEBSITE</p>
          <h2>테스트 주소 정하기</h2>
          <label>
            홈페이지 주소
            <input
              name="slug"
              placeholder="my-restaurant"
              pattern="[a-z0-9][a-z0-9-]{2,39}"
              minLength={3}
              maxLength={40}
              required
            />
          </label>
          <p className="help">
            공개 테스트 주소는 /s/입력한주소 입니다.
            <br />
            영문 소문자·숫자·하이픈, 3~40자
          </p>
          <div className="notice">고객 도메인은 홈페이지를 검증한 후 운영자가 연결합니다.</div>
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <button className="button primary full" disabled={busy}>
            {busy ? '생성 중…' : '이 템플릿으로 시작 →'}
          </button>
          <p className="help">용스 템플릿은 추후 추가 예정입니다.</p>
        </form>
      </div>
    </div>
  );
}
