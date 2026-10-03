import { cookies } from 'next/headers';
import { z } from 'zod';
import { mode, appUrl } from '@/lib/server/config';
import { sessionClient } from '@/lib/server/supabase';
import { sameOrigin, readJson, json, failure, HttpError } from '@/lib/server/http';
import { legalAcceptance } from '@/lib/legal';
import { legalPublished } from '@/lib/server/legal';
const credentials = z.object({
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(10, '비밀번호는 10자 이상 입력하세요.').max(128),
});
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    sameOrigin(request);
    const { action } = await context.params;
    const input = await readJson(request);
    if ((action === 'signup' || action === 'google') && !legalPublished())
      throw new HttpError(
        503,
        '가입 안내와 약관을 준비 중입니다. 기존 고객은 이메일로 로그인해 주세요.',
      );
    if (action === 'signup' && input.acceptedTerms !== true)
      throw new HttpError(400, '이용약관과 개인정보 수집·이용 내용을 확인하고 동의해 주세요.');
    const jar = await cookies();
    if (mode() === 'local') {
      const { localDatabase } = await import('@/lib/local/database');
      const auth = await import('@/lib/local/auth');
      const db = await localDatabase();
      if (action === 'logout') {
        await auth.localLogout(db, jar.get('restaurant_session')?.value || '');
        jar.delete('restaurant_session');
        return json({ ok: true });
      }
      const email = typeof input.email === 'string' ? input.email.toLowerCase().trim() : '';
      await auth.localRateLimit(db, `${action}:${email || 'reset'}`);
      if (action === 'signup' || action === 'login') {
        const data = credentials.parse(input);
        if (action === 'signup')
          await auth.localRegister(db, data.email, data.password, legalAcceptance);
        const token = await auth.localLogin(db, data.email, data.password);
        jar.set('restaurant_session', token, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 86400,
          secure: false,
        });
        return json({ ok: true });
      }
      if (action === 'recover') {
        const address = z.email().parse(email);
        const token = await auth.localRecovery(db, address);
        return json({
          message: '로컬 시연용 복구 링크입니다. 실제 메일은 발송하지 않았습니다.',
          localRecoveryUrl: `/login?mode=reset&token=${token}`,
        });
      }
      if (action === 'reset') {
        const data = z
          .object({ token: z.string().length(64), password: z.string().min(10).max(128) })
          .parse(input);
        await auth.localReset(db, data.token, data.password);
        jar.delete('restaurant_session');
        return json({ message: '비밀번호를 변경했습니다. 다시 로그인하세요.' });
      }
    } else {
      const client = await sessionClient();
      if (action === 'google') {
        if (process.env.GOOGLE_AUTH_ENABLED !== 'true')
          throw new HttpError(503, '구글 로그인 연결을 준비 중입니다. 이메일로 이용해 주세요.');
        const { data, error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${appUrl()}/auth/confirm`,
            skipBrowserRedirect: true,
            queryParams: { prompt: 'select_account' },
          },
        });
        if (error || !data.url)
          throw new HttpError(
            503,
            '구글 로그인을 시작하지 못했습니다. 이메일 로그인을 이용해 주세요.',
          );
        return json({ url: data.url });
      }
      if (action === 'login') {
        const { error } = await client.auth.signInWithPassword(credentials.parse(input));
        if (error) throw new HttpError(400, '이메일 인증 여부와 로그인 정보를 확인하세요.');
        return json({ ok: true });
      }
      if (action === 'signup') {
        const { data, error } = await client.auth.signUp({
          ...credentials.parse(input),
          options: { emailRedirectTo: `${appUrl()}/auth/confirm`, data: legalAcceptance },
        });
        if (error)
          throw new HttpError(
            400,
            '가입을 처리하지 못했습니다. 이메일과 비밀번호를 확인하거나 잠시 후 다시 시도하세요.',
          );
        return json(
          data.session
            ? { ok: true }
            : { message: '가입 확인 메일을 보냈습니다. 메일의 링크를 눌러 가입을 완료하세요.' },
        );
      }
      if (action === 'logout') {
        const { error } = await client.auth.signOut();
        if (error) throw error;
        return json({ ok: true });
      }
      if (action === 'recover') {
        const { error } = await client.auth.resetPasswordForEmail(z.email().parse(input.email), {
          redirectTo: `${appUrl()}/auth/confirm?flow=recovery`,
        });
        if (error)
          throw new HttpError(429, '복구 메일을 보내지 못했습니다. 잠시 후 다시 시도하세요.');
        return json({ message: '가입된 이메일이면 복구 링크가 전송됩니다.' });
      }
      if (action === 'reset') {
        const {
          data: { user },
        } = await client.auth.getUser();
        if (!user) throw new HttpError(401, '복구 메일의 링크를 다시 열어 주세요.');
        const { error } = await client.auth.updateUser({
          password: z.string().min(10).max(128).parse(input.password),
        });
        if (error)
          throw new HttpError(
            400,
            '비밀번호를 변경하지 못했습니다. 다른 비밀번호를 사용해 주세요.',
          );
        await client.auth.signOut({ scope: 'global' });
        return json({ message: '비밀번호를 변경했습니다. 다시 로그인하세요.' });
      }
    }
    throw new HttpError(404, '찾을 수 없습니다.');
  } catch (error) {
    return failure(error);
  }
}
