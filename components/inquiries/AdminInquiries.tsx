'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Inquiry } from '@/lib/inquiries';
import { selectionPrices } from '@/lib/inquiries';
function InquiryRow({ inquiry }: { inquiry: Inquiry }) {
  const router = useRouter();
  const [removed, setRemoved] = useState(false);
  const [status, setStatus] = useState(inquiry.status),
    [notes, setNotes] = useState(inquiry.notes),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  async function save(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inquiry.id, status, notes }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setMessage('저장했습니다.');
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '저장하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (
      busy ||
      !window.confirm(
        '이 상담 요청의 연락처·내용·동의 기록을 영구 삭제합니다. 삭제 요청이나 상담 목적 달성 여부를 확인했나요?',
      )
    )
      return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/inquiries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inquiry.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setRemoved(true);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '삭제하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }
  if (removed)
    return (
      <p className="panel" role="status">
        상담 정보를 삭제했습니다.
      </p>
    );
  return (
    <details className="panel inquiry-row">
      <summary>
        {inquiry.business} · {inquiry.name}{' '}
        <span className="pill">
          {status === 'new' ? '접수' : status === 'contacted' ? '상담 중' : '종료'}
        </span>
        <small>
          {new Date(inquiry.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
        </small>
      </summary>
      <p>
        연락 방법: {inquiry.method === 'email' ? '이메일' : '전화'} · {inquiry.contact}
      </p>
      <p className="inquiry-message">{inquiry.message}</p>
      <dl>
        <dt>선택 디자인</dt>
        <dd>
          {inquiry.selection.templateName} / {inquiry.selection.pages}페이지
        </dd>
        <dt>기본 포함</dt>
        <dd>{inquiry.selection.included.join(', ') || '기본 구성'}</dd>
        <dt>유료 추가</dt>
        <dd>{inquiry.selection.paid.join(', ') || '없음'}</dd>
        <dt>메뉴</dt>
        <dd>
          {inquiry.selection.navigation} / {inquiry.selection.mobileNavigation}
        </dd>
      </dl>
      <p>{selectionPrices(inquiry.selection)}</p>
      <Link className="button primary" href={`/admin/sites/new?inquiry=${inquiry.id}`}>
        고객 계정 연결·홈페이지 제작 →
      </Link>
      {inquiry.selection.template && (
        <Link
          href={`/templates/${inquiry.selection.template}?${inquiry.selection.query}`}
          target="_blank"
        >
          제출한 구성 미리보기 ↗
        </Link>
      )}
      <p className="muted">
        접수 번호: {inquiry.id}
        <br />
        동의: {inquiry.consent_version} ·{' '}
        {new Date(inquiry.consent_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
      </p>
      <form onSubmit={save}>
        <fieldset disabled={busy}>
          <label>
            처리 상태
            <select value={status} onChange={(e) => setStatus(e.target.value as Inquiry['status'])}>
              <option value="new">접수</option>
              <option value="contacted">상담 중</option>
              <option value="closed">종료</option>
            </select>
          </label>
          <label>
            운영자 메모
            <textarea
              rows={3}
              value={notes}
              maxLength={3000}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <button className="button" type="submit">
            {busy ? '저장 중…' : '상태·메모 저장'}
          </button>
        </fieldset>
        <p role="status">{message}</p>
      </form>
      <p className="muted">
        상담 목적을 달성했거나 삭제 요청을 받으면 개인정보를 삭제하세요. ‘종료’ 상태만으로 자동
        삭제되지는 않습니다. 백업에 남은 정보도 공급자 보관 정책에 따라 관리해야 합니다.
      </p>
      <button type="button" className="button" disabled={busy} onClick={remove}>
        상담 개인정보 삭제
      </button>
    </details>
  );
}
export function AdminInquiries({ inquiries }: { inquiries: Inquiry[] }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const filtered = inquiries.filter(
    (i) =>
      (filter === 'all' || i.status === filter) &&
      `${i.name} ${i.business} ${i.contact}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="inquiry-filters">
        <label>
          상태
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">전체</option>
            <option value="new">접수</option>
            <option value="contacted">상담 중</option>
            <option value="closed">종료</option>
          </select>
        </label>
        <label>
          이름·업종·연락처 검색
          <input value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>
      <p className="muted">
        최근 200건 중 {filtered.length}건 · 연락은 선택한 방법으로 직접 진행합니다. 자동 안내 메일의
        실제 발송 여부는 알림 발송 상태에서 확인합니다.
      </p>
      {filtered.map((i) => (
        <InquiryRow key={i.id} inquiry={i} />
      ))}
      {!filtered.length && <p className="panel">표시할 상담 요청이 없습니다.</p>}
    </>
  );
}
