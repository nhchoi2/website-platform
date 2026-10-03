'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { INQUIRY_CONSENT_VERSION, type Selection } from '@/lib/inquiries';
export function InquiryForm({
  selection,
  enabled,
  local,
}: {
  selection: Selection;
  enabled: boolean;
  local: boolean;
}) {
  const [method, setMethod] = useState('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');
  const attempt = useRef<{ body: string; key: string } | null>(null);
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get('name'),
      business: form.get('business'),
      contact: form.get('contact'),
      method,
      message: form.get('message'),
      website: form.get('website'),
      consent: form.get('consent') === 'on',
      consentVersion: INQUIRY_CONSENT_VERSION,
      template: selection.template,
      query: selection.query,
    };
    const body = JSON.stringify(payload);
    if (attempt.current?.body !== body) attempt.current = { body, key: crypto.randomUUID() };
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, key: attempt.current!.key }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '접수하지 못했습니다.');
      setReceipt(result.id);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : '연결하지 못했습니다. 입력 내용을 유지했으니 다시 시도해 주세요.',
      );
    } finally {
      setBusy(false);
    }
  }
  if (receipt)
    return (
      <section className="m-inquiry-success" role="status">
        <h2>상담 요청을 접수했습니다.</h2>
        <p>
          남겨주신 연락 방법으로 내용을 확인해 안내하겠습니다. 접수만으로 계약이나 결제가 시작되지
          않습니다.
        </p>
        <p>
          접수 번호: <code>{receipt}</code>
        </p>
        {local && (
          <p>
            로컬 시연 DB에 저장한 요청입니다. 운영 서비스로 전송하거나 이메일을 발송하지 않았습니다.
          </p>
        )}
        <Link className="m-button" href="/templates">
          템플릿 더 둘러보기 ↗
        </Link>
      </section>
    );
  return (
    <form className="m-inquiry-form" onSubmit={submit}>
      {local && (
        <p className="notice">
          로컬 검증용 접수입니다. 실제 고객 연락처 대신 테스트 정보를 입력하세요.
        </p>
      )}
      {!enabled && (
        <p className="notice">
          온라인 상담 접수를 준비 중입니다.{' '}
          <a href="mailto:koofylab@gmail.com">koofylab@gmail.com</a>으로 문의해 주세요.
        </p>
      )}
      <fieldset disabled={busy || !enabled}>
        <legend>상담에 필요한 정보</legend>
        <label>
          이름
          <input name="name" autoComplete="name" required maxLength={80} />
        </label>
        <label>
          업종 또는 상호
          <input
            name="business"
            autoComplete="organization"
            required
            maxLength={120}
            placeholder="예: 미용실 / 쿠피헤어"
          />
        </label>
        <label>
          연락받을 방법
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="email">이메일</option>
            <option value="phone">전화</option>
          </select>
        </label>
        <label>
          {method === 'email' ? '연락받을 이메일' : '연락받을 전화번호'}
          <input
            key={method}
            name="contact"
            type={method === 'email' ? 'email' : 'tel'}
            autoComplete={method === 'email' ? 'email' : 'tel'}
            maxLength={160}
            required
            placeholder={method === 'email' ? 'example@email.com' : '010-1234-5678'}
          />
        </label>
        <label>
          필요한 제작 내용
          <textarea
            name="message"
            rows={6}
            required
            minLength={10}
            maxLength={3000}
            placeholder="원하는 홈페이지, 준비된 자료, 참고 사이트 주소, 희망 일정 등을 알려주세요. 비밀번호나 주민등록번호는 입력하지 마세요."
          />
        </label>
        <label className="m-inquiry-trap" aria-hidden="true">
          웹사이트
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <details className="m-inquiry-consent">
          <summary>상담 정보 수집·이용 안내 보기</summary>
          <p>
            목적: 제작 상담 접수 및 후속 연락. 필수 항목: 이름, 업종 또는 상호, 연락 방법·연락처,
            요청 내용, 선택 구성, 동의 버전·시각. 보유: 상담 목적 달성 시 또는 삭제 요청 시
            파기하며, 계약으로 이어지는 정보는 별도 안내합니다. 처리는 운영자와 서비스 제공에 필요한
            저장·호스팅 업체에서 수행합니다. 동의를 거부할 수 있으나 온라인 상담 접수는 어렵습니다.
            삭제·열람 문의: koofylab@gmail.com.
          </p>
          <Link href="/privacy" target="_blank">
            개인정보 처리방침 ↗
          </Link>
        </details>
        <label className="m-inquiry-check">
          <input type="checkbox" name="consent" required />
          [필수] 상담 정보 수집·이용에 동의합니다.
        </label>
        <button className="m-button" type="submit">
          {busy ? '접수 중…' : '선택한 구성으로 상담 접수 ↗'}
        </button>
        <small>회원가입 없이 접수할 수 있습니다. 결제나 정기 구독이 시작되지 않습니다.</small>
      </fieldset>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
    </form>
  );
}
