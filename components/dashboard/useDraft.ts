'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Content } from '@/lib/content';
import type { Site } from '@/lib/types';
import { post } from '@/lib/client';
export function useDraft(site: Site) {
  const [content, setContent] = useState(site.draft);
  const [status, setStatus] = useState('저장됨');
  const [error, setError] = useState('');
  const latest = useRef(site.draft);
  const version = useRef(site.draft_version);
  const saved = useRef(JSON.stringify(site.draft));
  const blocked = useRef(false);
  const flight = useRef<Promise<number> | null>(null);
  const update = (value: Content | ((current: Content) => Content)) => {
    const next = typeof value === 'function' ? value(latest.current) : value;
    latest.current = next;
    setContent(next);
    setStatus('저장 대기');
  };
  const save = useCallback(async (): Promise<number> => {
    if (flight.current) {
      await flight.current;
    }
    if (blocked.current)
      throw new Error('저장 충돌이 발생했습니다. 편집 내용을 내려받은 뒤 새로고침하세요.');
    if (saved.current === JSON.stringify(latest.current)) return version.current;
    // Each save is serialized. Edits made during the request remain in the next draft.
    const work = async () => {
      setError('');
      while (saved.current !== JSON.stringify(latest.current)) {
        const snapshot = JSON.stringify(latest.current);
        setStatus('저장 중…');
        const result = await post<Site>(`/api/sites/${site.id}/save`, {
          content: JSON.parse(snapshot),
          version: version.current,
        });
        version.current = result.draft_version;
        saved.current = snapshot;
      }
      setStatus('저장됨');
      return version.current;
    };
    flight.current = work();
    try {
      return await flight.current;
    } catch (err) {
      const message = (err as Error).message;
      if (message.includes('다른 화면')) blocked.current = true;
      setError(message);
      setStatus('저장 실패');
      throw err;
    } finally {
      flight.current = null;
    }
  }, [site.id]);
  useEffect(() => {
    const timer = setTimeout(() => {
      void save().catch(() => {});
    }, 1500);
    return () => clearTimeout(timer);
  }, [content, save]);
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (JSON.stringify(latest.current) !== saved.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);
  const backup = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(latest.current, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site.slug}-unsaved-draft.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return { content, update, save, status, error, backup };
}
