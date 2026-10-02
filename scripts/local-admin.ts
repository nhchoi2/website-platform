import { createLocalDatabase } from '../lib/local/database';
import path from 'node:path';
const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes('@'))
  throw new Error('사용법: npm run local:admin -- user@example.com (서버를 중지한 상태에서 실행)');
if (process.env.VERCEL) throw new Error('로컬 전용 명령입니다.');
const db = await createLocalDatabase(path.resolve(process.env.LOCAL_DATA_DIR || '.local-data'));
try {
  const { rows } = await db.query<{ id: string }>('select id from auth.users where email=$1', [
    email,
  ]);
  if (!rows.length) throw new Error('먼저 로컬 화면에서 회원가입하세요.');
  await db.query('insert into admin_users(user_id) values($1) on conflict do nothing', [
    rows[0].id,
  ]);
  console.log('지정한 로컬 계정에 운영자 권한을 부여했습니다.');
} finally {
  await db.close();
}
