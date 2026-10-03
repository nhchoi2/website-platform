import type { CSSProperties } from 'react';
import type { Template } from './catalog';
import './catalog.css';

// Original SVG/CSS artwork for demos; replace with the customer's licensed photos at production.
export function TemplateArt({
  template,
  compact = false,
}: {
  template: Template;
  compact?: boolean;
}) {
  const style = {
    '--t-accent': template.accent,
    '--t-paper': template.background,
    '--t-ink': template.ink,
  } as CSSProperties;
  return (
    <div
      className={`t-art t-art-${template.slug} ${compact ? 't-art-compact' : ''}`}
      style={style}
      role="img"
      aria-label={`${template.industry} 템플릿 예시 일러스트`}
    >
      {template.slug === 'hyehwa' ? (
        <img src="/marketing/hyehwa-food.jpeg" alt="삼겹살과 김치 예시 음식 사진" />
      ) : (
        <svg viewBox="0 0 600 520" aria-hidden="true">
          <circle cx="390" cy="190" r="170" fill="currentColor" opacity=".08" />
          {template.slug === 'cafe' && (
            <>
              <path d="M70 390H535" stroke="currentColor" strokeWidth="3" />
              <ellipse cx="240" cy="390" rx="155" ry="28" fill="currentColor" opacity=".12" />
              <path d="M120 230h220v75a85 85 0 0 1-85 85h-50a85 85 0 0 1-85-85z" fill="#dba17b" />
              <ellipse cx="230" cy="230" rx="110" ry="30" fill="#faf4eb" />
              <ellipse cx="230" cy="230" rx="87" ry="19" fill="#6b4232" />
              <path
                d="M340 253h25a43 43 0 0 1 0 86h-34"
                fill="none"
                stroke="#dba17b"
                strokeWidth="22"
              />
              <path
                d="M430 170v220m0-180c-70-70-90-20-30 15m30 20c70-80 105-25 30 10m-30 40c-85-70-90-15-25 20"
                fill="none"
                stroke="#687e52"
                strokeWidth="9"
              />
            </>
          )}
          {template.slug === 'salon' && (
            <>
              <rect x="110" y="45" width="250" height="340" rx="125" fill="#cdb7bd" />
              <rect x="125" y="60" width="220" height="310" rx="110" fill="#ede4e0" />
              <path
                d="M142 260L320 85M145 300L328 118"
                stroke="#fff"
                strokeWidth="16"
                opacity=".6"
              />
              <path d="M230 385v50M160 437h140" stroke="currentColor" strokeWidth="5" />
              <rect x="410" y="275" width="70" height="120" rx="8" fill="#876c79" />
              <rect x="425" y="250" width="40" height="25" rx="4" fill="#c8a3b0" />
              <circle cx="445" cy="330" r="18" fill="#e6d6cc" />
              <path d="M385 410h145" stroke="currentColor" strokeWidth="3" />
            </>
          )}
          {template.slug === 'fitness' && (
            <>
              <path
                d="M90 410L485 110M155 435L550 135"
                stroke="currentColor"
                strokeWidth="3"
                opacity=".18"
              />
              <path d="M180 285L430 210" stroke="#c5d6cb" strokeWidth="22" />
              <rect
                x="110"
                y="203"
                width="70"
                height="185"
                rx="12"
                transform="rotate(-17 110 203)"
                fill="#d3ef58"
              />
              <rect
                x="165"
                y="210"
                width="35"
                height="140"
                rx="8"
                transform="rotate(-17 165 210)"
                fill="#819535"
              />
              <rect
                x="420"
                y="125"
                width="70"
                height="185"
                rx="12"
                transform="rotate(-17 420 125)"
                fill="#d3ef58"
              />
              <rect
                x="396"
                y="151"
                width="35"
                height="140"
                rx="8"
                transform="rotate(-17 396 151)"
                fill="#819535"
              />
              <text x="58" y="470" fill="currentColor" fontSize="48" fontWeight="900">
                KEEP MOVING.
              </text>
            </>
          )}
          {template.slug === 'market' && (
            <>
              <path d="M110 265h390l-40 165H155z" fill="#d7b37d" />
              <path
                d="M145 275l85-105h150l80 105"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
              />
              <circle cx="205" cy="275" r="65" fill="#f1a650" />
              <circle cx="330" cy="285" r="62" fill="#cf6346" />
              <path d="M220 211l20-35M330 225l-5-28" stroke="#487d4b" strokeWidth="9" />
              <ellipse
                cx="413"
                cy="235"
                rx="38"
                ry="95"
                transform="rotate(23 413 235)"
                fill="#5e9257"
              />
              <path
                d="M180 320v75m65-75v75m65-75v75m65-75v75m65-75v75"
                stroke="#aa8755"
                strokeWidth="7"
              />
            </>
          )}
          {template.slug === 'professional' && (
            <>
              <rect x="85" y="90" width="325" height="330" rx="10" fill="#dbe4f0" />
              <rect x="110" y="115" width="275" height="270" rx="4" fill="#fff" />
              <path d="M150 165h190m-190 35h125" stroke="#96afc8" strokeWidth="9" />
              <rect x="155" y="290" width="35" height="60" fill="#aabed4" />
              <rect x="220" y="255" width="35" height="95" fill="#658ab3" />
              <rect x="285" y="220" width="35" height="130" fill="#295487" />
              <circle cx="425" cy="340" r="74" fill="#295487" />
              <path d="M392 340l22 22 42-49" fill="none" stroke="#fff" strokeWidth="10" />
            </>
          )}
          {template.slug === 'care' && (
            <>
              <rect x="100" y="85" width="350" height="350" rx="110" fill="#c2e5df" />
              <path d="M255 165h45v70h70v45h-70v70h-45v-70h-70v-45h70z" fill="#fff" />
              <circle cx="445" cy="355" r="70" fill="#287a85" />
              <path d="M415 355l22 22 40-43" fill="none" stroke="#fff" strokeWidth="9" />
            </>
          )}
        </svg>
      )}
      {!compact && <span className="t-art-label">{template.english} / 예시 이미지</span>}
    </div>
  );
}
