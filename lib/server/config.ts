import 'server-only';
export function mode() {
  if (process.env.APP_MODE === 'local') {
    if (process.env.VERCEL) throw new Error('Vercel에서 로컬 모드를 사용할 수 없습니다.');
    return 'local' as const;
  }
  if (process.env.APP_MODE !== 'supabase')
    throw new Error('APP_MODE를 설정하세요. .env.example을 참고하세요.');
  return 'supabase' as const;
}
export function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase 환경 변수를 설정하세요.');
  return { url, key };
}
export function appUrl() {
  return (
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://127.0.0.1:3000')
  );
}
