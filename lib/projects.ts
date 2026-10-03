import { z } from 'zod';
export const stages = {
  consultation: '상담 중',
  quote: '견적 안내',
  materials: '자료 준비',
  production: '제작 중',
  review: '고객 검토',
  published: '공개 완료',
  closed: '종료',
} as const;
export const quoteSchema = z.object({
  setup: z.number().int().min(0).max(100000000),
  monthly: z.number().int().min(0).max(100000000),
  extras: z.number().int().min(0).max(100000000),
  scope: z.string().trim().min(1).max(3000),
});
export type Project = {
  id: string;
  inquiry_id: string | null;
  customer_id: string;
  site_id: string | null;
  stage: keyof typeof stages;
  message: string;
  quote: Partial<z.infer<typeof quoteSchema>>;
  quote_seen_at: string | null;
  version: number;
  email?: string;
  created_at: string;
  updated_at: string;
};
export type ProjectFile = {
  id: string;
  project_id: string;
  uploader_id: string;
  path: string;
  name: string;
  bytes: number;
  mime: 'image/webp' | 'application/pdf';
  created_at: string;
};
export type ProjectEvent = {
  id: string;
  stage: keyof typeof stages;
  message: string;
  quote: Project['quote'];
  version: number;
  created_at: string;
};
export type ProjectDetail = { project: Project; events: ProjectEvent[]; files: ProjectFile[] };
export const evidenceKinds = {
  cash_personal: '현금영수증 · 개인 소득공제',
  cash_business: '현금영수증 · 사업자 지출증빙',
  tax_invoice: '세금계산서',
} as const;
export const evidenceSchema = z
  .object({
    project: z.uuid(),
    key: z.uuid(),
    kind: z.enum(['cash_personal', 'cash_business', 'tax_invoice']),
    identifierType: z.enum(['phone', 'card', 'business']),
    identifier: z
      .string()
      .transform((v) => v.replace(/[\s-]/g, ''))
      .pipe(z.string().regex(/^\d{10,19}$/, '번호는 숫자로 입력하세요.')),
    name: z.string().trim().min(1).max(120),
    email: z.email().max(254),
    consent: z.literal(true),
  })
  .refine(
    (v) =>
      v.kind === 'cash_personal'
        ? v.identifierType === 'phone'
          ? /^01\d{8,9}$/.test(v.identifier)
          : v.identifierType === 'card' && /^\d{16,19}$/.test(v.identifier)
        : v.identifierType === 'business' && /^\d{10}$/.test(v.identifier),
    '휴대폰번호 또는 카드번호를 확인하세요. 사업자 증빙은 사업자등록번호 10자리가 필요합니다.',
  );
export type Evidence = {
  id: string;
  project_id: string;
  customer_id: string;
  kind: keyof typeof evidenceKinds;
  identifier: string;
  name: string;
  email: string;
  status: 'requested' | 'issued' | 'rejected' | 'withdrawn';
  reference: string;
  message: string;
  created_at: string;
  issued_at: string | null;
};
