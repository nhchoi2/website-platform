'use client';
import { useState } from 'react';
import { post } from '@/lib/client';
import type { Asset } from '@/lib/types';
import type { Content } from '@/lib/content';
type Menu = Content['menus'][number];
export function MenuEditor({
  menus,
  siteId,
  updateMenu,
  addMenu,
  removeMenu,
  moveMenu,
  onAsset,
}: {
  menus: Menu[];
  siteId: string;
  updateMenu: (id: string, patch: Partial<Menu>) => void;
  addMenu: () => void;
  removeMenu: (id: string) => void;
  moveMenu: (from: number, to: number) => void;
  onAsset: (asset: Asset) => void;
}) {
  const [uploading, setUploading] = useState('');
  const [error, setError] = useState('');
  return (
    <div>
      <div className="section-title">
        <div>
          <h2>메뉴를 소개해 주세요</h2>
          <p className="muted">대표 메뉴는 홈페이지 상단에 한 번 더 소개됩니다.</p>
        </div>
        <button className="button secondary" onClick={addMenu} disabled={menus.length >= 100}>
          + 메뉴 추가
        </button>
      </div>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {menus.length === 0 && (
        <div className="empty-state">
          <span>＋</span>
          <h3>첫 메뉴를 추가해 보세요</h3>
          <p>이름, 가격, 사진만으로도 훌륭한 시작입니다.</p>
          <button className="button primary" onClick={addMenu}>
            메뉴 추가
          </button>
        </div>
      )}
      <div className="menu-edit-list">
        {menus.map((menu, index) => (
          <article className="menu-edit-card" key={menu.id}>
            <div className="menu-upload">
              {menu.imageId ? (
                <img
                  src={`/api/media/${menu.imageId}?private=1&site=${siteId}`}
                  alt={menu.name || '메뉴 사진'}
                />
              ) : (
                <div className="menu-image-empty">메뉴 사진</div>
              )}
              <label className="button secondary small">
                {uploading === menu.id ? '업로드 중…' : menu.imageId ? '사진 교체' : '사진 업로드'}
                <input
                  className="sr-only"
                  aria-label={`메뉴 ${index + 1} 사진`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={!!uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file) return;
                    setUploading(menu.id);
                    setError('');
                    try {
                      const form = new FormData();
                      form.set('file', file);
                      const asset = await post<Asset>(`/api/sites/${siteId}/upload`, form);
                      onAsset(asset);
                      updateMenu(menu.id, { imageId: asset.id });
                    } catch (err) {
                      setError((err as Error).message);
                    } finally {
                      setUploading('');
                    }
                  }}
                />
              </label>
              {menu.imageId && (
                <button
                  className="text-button"
                  onClick={() => updateMenu(menu.id, { imageId: null })}
                >
                  사진 제거
                </button>
              )}
            </div>
            <div className="menu-fields">
              <div className="form-grid">
                <label>
                  메뉴 이름
                  <input
                    value={menu.name}
                    maxLength={100}
                    placeholder="예: 숙성 삼겹살"
                    onChange={(e) => updateMenu(menu.id, { name: e.target.value })}
                  />
                </label>
                <label>
                  가격
                  <input
                    value={menu.price}
                    maxLength={50}
                    placeholder="예: 18,000원 / 180g"
                    onChange={(e) => updateMenu(menu.id, { price: e.target.value })}
                  />
                </label>
              </div>
              <label>
                설명
                <textarea
                  rows={2}
                  value={menu.description}
                  maxLength={500}
                  placeholder="맛과 재료에 대한 이야기를 적어주세요."
                  onChange={(e) => updateMenu(menu.id, { description: e.target.value })}
                />
              </label>
              <div className="form-grid">
                <label>
                  카테고리
                  <input
                    value={menu.category}
                    maxLength={80}
                    placeholder="예: 구이류"
                    onChange={(e) => updateMenu(menu.id, { category: e.target.value })}
                  />
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={menu.featured}
                    onChange={(e) => updateMenu(menu.id, { featured: e.target.checked })}
                  />
                  대표 메뉴로 소개
                </label>
              </div>
              <div className="menu-edit-actions">
                <button
                  className="text-button"
                  disabled={index === 0}
                  onClick={() => moveMenu(index, index - 1)}
                >
                  ↑ 위로
                </button>
                <button
                  className="text-button"
                  disabled={index === menus.length - 1}
                  onClick={() => moveMenu(index, index + 1)}
                >
                  ↓ 아래로
                </button>
                <button className="text-button danger-text" onClick={() => removeMenu(menu.id)}>
                  메뉴 삭제
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
