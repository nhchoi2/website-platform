import { z } from 'zod';
import { findTemplate } from '@/templates/catalog/catalog';
import {
  parseOptions,
  optionsQuery,
  featureOptions,
  type PreviewOptions,
  type Query,
} from '@/templates/catalog/options';
import { pricing, formatWon } from '@/components/marketing/content';
export const INQUIRY_CONSENT_VERSION = 'consultation-2026-10-03';
export const inquirySchema = z
  .object({
    key: z.string().uuid(),
    name: z.string().trim().min(1, '이름을 입력해 주세요.').max(80),
    business: z.string().trim().min(1, '업종 또는 상호를 입력해 주세요.').max(120),
    method: z.enum(['email', 'phone']),
    contact: z.string().trim().max(160),
    message: z.string().trim().min(10, '요청 내용을 10자 이상 입력해 주세요.').max(3000),
    template: z.string().max(40).default(''),
    query: z.string().max(4000).default(''),
    consent: z.literal(true, { error: '상담 정보 수집·이용에 동의해 주세요.' }),
    consentVersion: z.literal(INQUIRY_CONSENT_VERSION),
    website: z.string().max(100).default(''),
  })
  .superRefine((value, ctx) => {
    const valid =
      value.method === 'email'
        ? z.email().safeParse(value.contact).success
        : /^0[0-9]{8,10}$/.test(value.contact.replace(/[\s-]/g, ''));
    if (!valid)
      ctx.addIssue({
        code: 'custom',
        path: ['contact'],
        message: '연락받을 이메일 또는 전화번호를 확인해 주세요.',
      });
    if (value.template && !findTemplate(value.template))
      ctx.addIssue({ code: 'custom', path: ['template'], message: '템플릿을 다시 선택해 주세요.' });
  });
export type InquiryInput = z.infer<typeof inquirySchema>;
export type Inquiry = {
  id: string;
  key: string;
  name: string;
  business: string;
  method: 'email' | 'phone';
  contact: string;
  message: string;
  selection: Selection;
  status: 'new' | 'contacted' | 'closed';
  notes: string;
  created_at: string;
  consent_version: string;
  consent_at: string;
  updated_at: string;
};
export type Selection = {
  template: string;
  templateName: string;
  industry: string;
  query: string;
  pages: number;
  included: string[];
  paid: string[];
  navigation: string;
  mobileNavigation: string;
  setup: number;
  monthly: number;
  needsQuote: boolean;
};
export function selectionSummary(slug: string, query: Query): Selection {
  const template = findTemplate(slug);
  const options: PreviewOptions = parseOptions(query);
  const chosen = featureOptions.filter((f) => options.features.includes(f.id));
  return {
    template: template?.slug || '',
    templateName: template?.name || '상담 후 선택',
    industry:
      (options.business && findTemplate(options.business)?.industry) || template?.industry || '',
    query: template ? optionsQuery(options) : '',
    pages: options.pages,
    included: chosen.filter((f) => f.cost === 'included').map((f) => f.label),
    paid: chosen.filter((f) => f.cost === 'paid').map((f) => f.label),
    navigation: options.nav === 'left' ? '왼쪽' : options.nav === 'center' ? '가운데' : '오른쪽',
    mobileNavigation: options.mobileNav === 'hamburger' ? '메뉴 버튼' : '펼쳐보기',
    setup: pricing.setup,
    monthly: pricing.monthly,
    needsQuote: options.pages !== 1 || chosen.some((f) => f.cost === 'paid'),
  };
}
export function selectionFromInput(input: InquiryInput) {
  return selectionSummary(input.template, Object.fromEntries(new URLSearchParams(input.query)));
}
export function selectionPrices(selection: Selection) {
  return `기본 제작 ${formatWon(selection.setup)}부터 · 월 관리 ${formatWon(selection.monthly)}부터 · 부가세 포함${selection.needsQuote ? ' · 추가 페이지·유료 옵션 별도 견적' : ''}`;
}
