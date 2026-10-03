import 'server-only';
import { mode } from './config';
export function legalPublished() {
  return mode() === 'local' || process.env.LEGAL_PUBLISHED === 'true';
}
export function legalOperator() {
  return {
    name: process.env.SERVICE_OPERATOR_NAME || '쿠피 운영자 (사업자 정보 확인 중)',
    address: process.env.SERVICE_OPERATOR_ADDRESS || '운영자 확인 중',
    number: process.env.SERVICE_OPERATOR_NUMBER || '운영자 확인 중',
    privacyContact: process.env.PRIVACY_CONTACT_NAME || '쿠피 운영자',
    email: 'koofylab@gmail.com',
  };
}
