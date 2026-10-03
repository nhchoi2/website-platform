'use client';
import { useState } from 'react';
import type { Template } from '../catalog';
import { TemplateArt } from '../TemplateArt';

export function CategoryItems({
  template,
  presentation,
}: {
  template: Template;
  presentation: 'portfolio' | 'products';
}) {
  const [category, setCategory] = useState('전체');
  const categories = ['전체', ...new Set(template.items.map((x) => x.category))];
  const items = template.items.filter((x) => category === '전체' || x.category === category);
  return (
    <div className={`d-category-items d-${presentation}`}>
      <div className="d-category-tabs" role="group" aria-label="분류 선택">
        {categories.map((x) => (
          <button key={x} aria-pressed={category === x} onClick={() => setCategory(x)}>
            {x}
          </button>
        ))}
      </div>
      <p className="d-filter-count" role="status">
        {category} · {items.length}개
      </p>
      <div className="d-category-grid">
        {items.map((item) => (
          <article key={item.name}>
            <TemplateArt template={template} compact />
            <small>{item.category}</small>
            <h3>{item.name}</h3>
            <p>{item.detail}</p>
            <strong>{item.price}</strong>
          </article>
        ))}
      </div>
    </div>
  );
}
