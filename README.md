# 쿠피 · 소상공인 웹사이트 제작·관리

하나의 Next.js 프로그램에서 고객별 콘텐츠와 도메인을 분리합니다. 고객은 자기 매장 한 곳의 초안을 편집하고, 운영자가 제출본을 검수한 뒤 공개합니다. 콘텐츠 게시에는 재배포가 필요하지 않습니다.

## 구현 범위

- 실제 업체의 정보 구성을 참고한 서로 다른 7종 제작 상담용 디자인, 원페이지·3페이지·4페이지 메뉴 이동
- 업종 추천 필터, 다른 업종의 예시 콘텐츠 적용, 갤러리·비교표·담당자·시간표·공지·이용 절차·외부 링크 체크박스 미리보기, 구성 URL·메일 문의 (`docs/template-catalog.md`)
- 회원가입, 로그인/로그아웃, 이메일 확인, 비밀번호 복구
- 혜화 기반 템플릿 선택, 매장 정보/외부 링크/정해진 색상 편집
- 자동·수동 임시 저장, 저장 상태, 충돌 감지, 미저장 JSON 내려받기
- 사진 드롭 업로드·교체·제거·순서 변경, 보관함, 사용하지 않는 원본 삭제
- 메뉴 사진·이름·가격·설명·카테고리·대표 메뉴, 순서 변경
- 로그인한 소유자와 운영자만 보는 모바일/데스크톱 미리보기
- 고정된 제출본, 보완 의견, 운영자 변경 비교, 승인·게시
- 게시 이력과 이전 공개본 복구, 고객별 JSON+이미지 ZIP 내보내기
- 고객 소유 도메인·연결 상태·만료일·메모, 정확한 Host 기반 라우팅

결제, 주문, 자체 예약, AI, 리뷰 수집, 자유 배치 편집기는 포함하지 않습니다. 용스 파일은 아직 전달되지 않아 템플릿을 추가하지 않았습니다. 기존 혜화·용스 프로젝트와 배포는 수정하지 않습니다.

새 업종별 카탈로그는 제작 상담용 예시입니다. 고객 편집·검수·게시가 실제 연결된 템플릿은 기존 혜화 1종이며, 새 업종·다중 페이지·옵션의 고객 관리 연동은 별도 작업입니다. 추가 페이지·기능 가격은 아직 미정입니다. 문의 버튼은 메일 앱을 열며 직접 발송 전 접수되지 않습니다.

## 실행

Node.js 20.19 이상(배포는 22 이상 권장), npm을 사용합니다.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`http://127.0.0.1:3000`을 엽니다. `APP_MODE=local`은 **로컬 시연 전용**입니다. PGlite PostgreSQL과 파일은 `.local-data/`에 실제 저장되며, 새로고침·로그아웃·서버 재시작 후에도 유지됩니다. 로컬 비밀번호는 scrypt, 세션·복구 토큰은 SHA-256 해시로 저장합니다. 복구 메일 대신 로컬 복구 링크를 화면에 표시합니다. Vercel에서는 로컬 모드 실행을 차단합니다.

로컬 운영자 지정: 화면에서 회원가입 → 개발 서버 중지 → 아래 명령 → 서버 재시작.

```bash
npm run local:admin -- you@example.com
```

PGlite는 여러 프로세스가 동일한 데이터 폴더를 동시에 열면 안 됩니다. 운영자 지정과 파일 백업 전 반드시 서버를 중지하세요. 테스트는 별도 임시 DB를 사용합니다.

## 환경 변수

모든 변수는 서버 전용입니다. `.env*`는 `.env.example`을 제외하고 Git에서 무시합니다. 키를 코드·채팅·스크린샷·로그에 넣지 마세요.

| 변수                        | 용도                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| `APP_MODE`                  | `local` 또는 `supabase`; 외부 배포는 반드시 `supabase`                                              |
| `APP_URL`                   | 관리 서비스의 정확한 기본 URL. 인증 이메일 리다이렉트에 사용                                        |
| `PLATFORM_HOSTS`            | 관리 서비스 호스트 목록(쉼표 구분). 개발은 `127.0.0.1:3000,localhost:3000`. 고객 도메인을 넣지 않음 |
| `SUPABASE_URL`              | 프로젝트 URL                                                                                        |
| `SUPABASE_PUBLISHABLE_KEY`  | publishable 또는 legacy anon 키                                                                     |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버의 이미지 I/O 전용 secret 또는 legacy service_role 키. 고객 데이터 쓰기에는 사용하지 않음       |
| `LOCAL_DATA_DIR`            | 로컬 모드 데이터 경로. 기본 `.local-data`                                                           |

설정 값이 없으면 운영 가능한 것처럼 가짜 데이터를 제공하지 않습니다. 로컬 모드와 Supabase 모드를 명시적으로 선택해야 합니다.

## Supabase 설정

1. 별도 프로젝트를 생성합니다. 현재 대상은 `website-platform`, 서울 리전입니다.
2. SQL Editor에서 `supabase/migrations/001_platform.sql`, `002_storage.sql`, `003_customer_directory.sql`, `004_accounts_and_consent.sql` 순서대로 실행합니다. 새 프로젝트에 한 번만 적용합니다. 기존 프로젝트에는 아직 적용하지 않은 번호만 실행합니다. 전체를 `begin; ... commit;`으로 감싸면 함께 적용할 수 있습니다. 이후 변경은 기존 파일을 고치지 말고 번호가 증가하는 새 마이그레이션으로 기록하세요.
3. 앱의 모든 테이블에 RLS를 적용합니다. `anon`은 테이블을 조회할 수 없고, `authenticated`는 소유자 또는 DB의 `admin_users`에 등록된 운영자만 조회합니다. 테이블 직접 쓰기는 금지하고, 권한을 검사하는 DB 함수로만 변경합니다.
4. `restaurant-images` 버킷은 **private**입니다. JPG/PNG/WebP 입력을 서버에서 실제 디코딩하고 최대 2400px WebP로 재인코딩합니다. EXIF 정보는 제거합니다. 입력 한 장 3MB, 4천만 픽셀 이하, 고객별 원본 250개 제한입니다. 저장소의 직접 INSERT/UPDATE/DELETE는 허용하지 않습니다. 서버는 소유권을 검사한 후 기존 키를 덮어쓰지 않는 방식으로 업로드합니다.
5. Authentication → URL Configuration에 `APP_URL`을 Site URL로 지정하고, 정확한 `/auth/confirm`과 `/auth/confirm?flow=recovery`를 Redirect URLs에 등록합니다. 개발 주소도 필요하면 별도로 등록합니다. 임의의 외부 URL이나 넓은 wildcard는 허용하지 마세요.
6. Authentication → Emails → SMTP Settings에서 발신 서비스·발신 도메인·SMTP 호스트/포트/사용자/비밀번호를 설정합니다. 기본 메일 서비스에는 수신자/발송량 제한이 있으므로 실제 고객 가입 전 custom SMTP를 설정해야 합니다. 이메일 확인을 끄지 마세요.
7. 기본 이메일 템플릿의 PKCE `code` 콜백을 지원합니다. SMTP 설정 후 커스텀 템플릿을 쓸 경우 가입 확인 링크는 `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`, 복구 링크는 `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`입니다. PKCE는 요청한 브라우저의 쿠키가 필요합니다. 다른 브라우저에서 링크를 열어 실패하면 원래 브라우저에서 재시도하세요.
8. 최초 운영자가 서비스에서 가입하고 이메일 확인을 완료한 뒤 SQL Editor에서 검증된 사용자 UUID를 `admin_users`에 추가합니다. 클라이언트가 보낸 이메일/메타데이터를 관리자 판정에 사용하지 않습니다.

현재 지정된 운영자 이메일은 `koofylab@gmail.com`입니다. 계정 확인 후 다음과 같이 지정합니다.

```sql
insert into public.admin_users(user_id)
select id from auth.users
where lower(email) = 'koofylab@gmail.com' and email_confirmed_at is not null
on conflict do nothing;
```

실제 1행이 지정되었는지 확인하세요. 권한 회수는 해당 UUID의 `admin_users` 행을 삭제하면 됩니다. 서버는 매 요청마다 인증 사용자와 현재 DB 권한을 확인합니다.

## 수정 위치

```text
app/dashboard/              고객 관리 화면 진입점
components/dashboard/       정보·사진·메뉴 편집기, 직렬 자동 저장
app/admin/                  운영자 목록과 매장별 검수
components/admin/           변경 비교·승인·복구·도메인 기록
app/login/, app/auth/       로그인 UI, 이메일 콜백
app/preview/                비공개 초안/제출본 미리보기
app/s/[slug]/               테스트 주소의 공개본
app/page.tsx                고객 도메인의 공개본
app/api/                    서버 권한 검사, 업로드, 검수, 내보내기
templates/hyehwa/            혜화 템플릿 컴포넌트와 모든 디자인 CSS
lib/content.ts              콘텐츠 타입·검증·이미지 참조·변경 비교
lib/server/                 인증·DB·파일 저장소·응답 처리
lib/local/                  로컬 인증과 PGlite 어댑터 (운영 서비스 아님)
supabase/migrations/        재현 가능한 DB 구조·함수·RLS·Storage 정책
tests/                      핵심 트랜잭션·접근 제한 테스트
scripts/                    운영자 지정·로컬 백업·명시적 원격 검증
```

혜화의 실제 `app/globals.css`, `config/theme.ts`, Hero, Header, MenuCard, 홈 구성을 확인하고 새 콘텐츠 모델에 맞게 옮겼습니다. 원본 프로젝트를 import하거나 수정하지 않습니다. 새로운 템플릿은 디자인을 별도 폴더에 추가하고 콘텐츠 검증의 허용 목록도 함께 확장해야 합니다.

## 저장·검수·게시의 규칙

- `sites.draft`만 편집합니다. 저장에 시간 제한이나 편집 잠금은 없습니다.
- 1.5초 입력 정지 후 자동 저장하며 요청을 직렬 처리합니다. 저장 중 새 입력은 다음 저장에 포함됩니다. 네트워크 실패는 화면에 표시하고 재시도할 수 있습니다.
- `draft_version`이 다르면 409 충돌을 반환합니다. 다른 탭의 수정본을 덮어쓰지 않습니다. 현재 편집 JSON을 내려받고 새로고침하여 합쳐주세요.
- 제출 시 행 잠금 안에서 `revisions`에 불변 스냅샷을 생성합니다. 대기 제출본은 매장당 하나이며 이후 초안 편집은 계속됩니다.
- 제출/게시/복구의 요청 UUID를 저장하여 중복 클릭과 응답 유실 후 재시도를 처리합니다.
- 승인은 **선택한 submission와 revision ID**를 검사하고, 게시 이력 생성·공개 포인터 변경·상태 갱신을 한 트랜잭션에서 실행합니다. 이미지 존재도 먼저 확인합니다. DB 작업 실패 시 이전 공개 포인터가 유지됩니다.
- 수정된 초안은 재검수해야 합니다. 이미 공개된 이력만 복구할 수 있습니다. 복구는 새 이력을 추가하고 초안을 변경하지 않습니다.
- 공개 응답은 현재 승인된 revision만 읽습니다. 인증 페이지/미리보기/이미지는 캐시하지 않습니다. 비공개 미리보기는 인증 및 소유권 검사를 통과해야 합니다.
- 페이지에서 사진 제거/교체는 해당 초안의 참조만 바꿉니다. 이전 제출본·공개 이력에 사용한 원본은 복구를 위해 보관합니다. 어디에도 사용하지 않는 원본만 영구 삭제할 수 있습니다.

## GitHub / Vercel 배포

가입·구글 OAuth·동의 기록·담당자 정보와 활성화 환경 변수는 [가입 설정 문서](docs/account-onboarding.md)에 정리했습니다. 약관 초안은 운영자 정보와 외부 처리 조건을 확정한 뒤 `LEGAL_PUBLISHED=true`로 활성화합니다. Google 연결은 실제 provider 검증 후 `GOOGLE_AUTH_ENABLED=true`로 활성화합니다.

하나의 GitHub 저장소 `nhchoi2/website-platform`과 하나의 Vercel 프로젝트를 사용합니다. 고객마다 복제하지 않습니다. 기존 혜화·용스 Vercel 프로젝트에 이 저장소를 연결하지 마세요.

1. 변경을 커밋·푸시합니다. CI에서 lint/typecheck/test/build가 실행됩니다.
2. Vercel → Add New Project → 위 저장소를 가져옵니다. Framework Next.js, Root Directory `.`를 선택합니다.
3. 환경 변수를 설정합니다. `APP_MODE=supabase`, `APP_URL`과 `PLATFORM_HOSTS`는 새 프로젝트의 실제 테스트 주소로 설정합니다. 생략하면 Vercel의 신뢰할 수 있는 시스템 변수(`VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_URL`)로 해당 프로젝트 호스트를 인식합니다. Supabase 키는 Vercel의 환경 변수에서만 보관합니다. Preview 배포는 별도 테스트 Supabase 프로젝트 권장, 그렇지 않으면 운영 데이터를 공유한다는 점에 주의하세요.
4. 배포 후 Supabase의 인증 리다이렉트 허용 목록을 실제 주소에 맞춥니다.
5. 고객 A/B 계정, 관리자, 이미지 업로드, 승인·복구를 테스트 주소 `/s/매장주소`에서 확인합니다.
6. 유료 고객을 운영하기 전 Vercel 상업용 요금제와 SMTP를 준비합니다. Hobby는 개인 비상업용입니다. 자동 업그레이드/과금은 구현하지 않습니다.

고객 콘텐츠 저장·승인에는 프로그램 재배포가 필요 없습니다. 코드·템플릿 또는 환경 변수 변경 때만 재배포합니다.

## 고객 도메인 연결

1. 고객이 도메인을 구매·소유하고, 운영자에게 DNS 수정에 필요한 권한만 위임합니다. 가비아 비밀번호를 받지 않습니다.
2. 새 Vercel 프로젝트 → Settings → Domains에 도메인을 추가합니다.
3. Vercel이 그 도메인에 제시한 DNS 레코드를 고객 DNS에 적용합니다. 임의로 고정 IP를 가정하지 않습니다.
4. Vercel의 소유권·DNS·HTTPS 정상 상태를 확인합니다.
5. 운영자 화면에서 **정확한 호스트명**을 등록하고 상태를 `연결 완료`로 기록합니다. apex와 www는 각각 등록해야 합니다. 다른 고객에게 이미 등록된 도메인은 거부됩니다.
6. 고객 A 도메인에서 A 공개본만 표시되고, B 경로/미등록 Host는 404인지 확인합니다. 도메인을 `연결 대기` 또는 `점검 필요`로 바꾸면 이 앱의 공개 라우팅은 차단됩니다.

도메인 상태는 운영자가 확인한 결과를 기록하는 기능입니다. 실제 DNS 조회, 구매, 자동 갱신, 만료 알림은 첫 버전에 포함하지 않습니다.

## 백업과 복구

**콘텐츠 복구:** 운영자 → 게시 이력 → 버전 미리보기 → 이 버전으로 복구. 이미 공개한 스냅샷만 선택할 수 있습니다.

**고객별 내보내기:** 운영자 사이트 상세의 ZIP 내보내기는 `site.json`(초안, 버전, 제출, 게시, 도메인, 파일 목록)과 `images/{assetId}.webp`를 제공합니다. 사용자 비밀번호나 인증 세션은 포함하지 않습니다. 원본 이름은 JSON에 있습니다. 내보낸 ZIP은 고객 개인정보를 포함하므로 접근을 제한해서 보관하세요. 이는 이동 가능한 콘텐츠 사본이며 자동 계정 복원 기능은 아닙니다.

**Supabase 재해 복구:** DB 백업과 Storage 원본을 **각각** 보관해야 합니다. DB 백업만으로 이미지 파일이 복구되지 않습니다. 운영 전 Supabase DB 백업/덤프 정책을 결정하고, Storage를 별도 저장 위치로 정기 복사하세요. 무료 플랜에 자동 복구 보장이 있다고 가정하지 않습니다. 복구 시 서비스 쓰기를 잠시 중지하고, 새 프로젝트에서 마이그레이션/DB 백업 → 인증 사용자 → 동일 경로의 Storage 객체 → 환경 변수 전환 순서와 연결성을 검증하세요. Auth UUID가 유지되는 DB/인증 전체 백업을 권장합니다. 고객별 ZIP을 새 계정에 수동 이관할 때에는 소유자와 사진 ID/경로를 명시적으로 매핑하고, 초안으로 가져와 다시 검수하세요. 역사 불변 트리거를 평상시 해제하지 마세요.

**로컬 전체 백업:** 서버를 중지한 후 `npm run local:backup`. `.local-data` 전체(PGlite DB + uploads)가 `backups/`에 복사됩니다. 복구는 서버를 중지하고 현재 폴더를 보존한 채 백업 폴더를 `LOCAL_DATA_DIR`로 지정하거나 원래 위치로 복원한 후 실행합니다.

## 검증 명령

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

핵심 테스트는 실제 PostgreSQL 엔진에서 RLS/권한, 영속 인증, 복구 토큰, 충돌, 스냅샷 불변성, 중복 요청, 강제 게시 실패의 트랜잭션 롤백, 사진 소유권, 이전 공개본 복구, 도메인 분리를 검사합니다. 이메일 발송, Vercel 배포, DNS까지 검증한 것으로 확대 해석하지 않습니다.

`scripts/remote-acceptance.ts`는 명시적으로 선택된 Supabase와 실행 중인 앱을 대상으로 실제 원격 통합 검증을 수행합니다. 검증용 계정과 사이트가 만들어지므로 임의의 운영 프로젝트에서 실행하지 마세요. 자격 증명은 `.test-data/`에만 저장합니다. `prepare` 이후 출력된 검증용 운영자 UUID에 대한 임시 권한을 승인받아 지정하고 `run`을 실행합니다. 종료 후 운영자 권한을 회수합니다. 테스트는 실제 Auth/DB/Storage를 사용하지만 SMTP 수신 여부는 별도로 확인해야 합니다.

## 비용 확인

Supabase DB/Storage/전송량·백업, SMTP 발송 서비스, Vercel의 상업용 플랜·초과 사용량, 고객 도메인 갱신이 비용 항목입니다. 요금은 [Supabase 공식 페이지](https://supabase.com/pricing)와 [Vercel 공식 페이지](https://vercel.com/pricing)에서 확인하세요. 도메인은 고객 소유이며 자동 구매하지 않습니다.

## 공개 서비스 홈페이지와 접속 경로

- 회사 홈페이지: `https://www.koofy.co.kr/` (별도 기존 프로젝트)
- 이 서비스의 대표 주소: `https://sites.koofy.co.kr/`
- `/`: 로그인 없이 볼 수 있는 서비스 소개와 시작 버튼
- `/templates`: 구조가 다른 제작 상담용 디자인 7종과 업종별 추천 필터. 새 디자인은 고객 편집·게시와 아직 연동되지 않음
- `/templates/[slug]`: 예시 업종·페이지·기능을 선택하는 상세보기
- `/template-preview/[slug]/[[...section]]`: 선택 구성을 유지하는 공개 예시 사이트 (검색 제외, 실제 고객의 비공개 초안과 별개)
- `/templates/hyehwa/classic`: 기존 Restaurant 컴포넌트로 렌더링한 공개 샘플. `?theme=olive|charcoal|warm` 지원
- `/projects`: 쿠피랩의 실제 썸네일·설명을 옮긴 제작 사례 3개와 콘셉트 1개
- `/pricing`: 기본 제작 390,000원부터 / 운영·관리 월 33,000원부터의 요금 초안과 제공 범위 (부가세 포함, 최종 견적 상담)
- `/guide`: 제작 절차, 자료 준비, FAQ
- `/account`: 서버가 인증·운영자 권한을 확인해 `/admin` 또는 `/dashboard`로 이동
- `/login`: 가입·로그인·복구. 로그인된 계정은 자신의 관리 화면으로 이동하며 복구/비밀번호 재설정 경로는 유지
- 고객이 연결한 도메인의 `/`에서는 그 고객의 승인된 공개본만 표시. 서비스 안내 페이지는 고객 도메인에서 열리지 않음

공개 문구·상담 이메일·헤더/푸터는 `components/marketing/`, 페이지는 `app/(marketing)/`에서 수정합니다. 서비스 루트와 고객 도메인 분기는 `app/page.tsx`, SEO 공통 메타데이터는 `lib/server/marketing.ts`, 검색 목록은 `app/sitemap.ts`, 검색 정책은 `app/robots.ts`입니다.

카탈로그 7종의 AI 예시 사진 22장은 `public/template-images/`에 있습니다. 이미지 교체·생성 기록은 `docs/template-images.md`, 선택 코드는 `templates/catalog/images.ts`를 수정합니다.

`public/marketing/hyehwa-food.jpeg`는 기존 혜화 프로젝트에서 가져온 고정 템플릿 소개용 사진입니다. 샘플 문구·메뉴는 예시로 표시하며 고객 계정에 복사하지 않습니다. 고객 업로드는 기존 비공개 Storage에만 저장합니다. 용스 템플릿은 추가하지 않았습니다.

### 서비스 도메인 배포 설정

2026-10-02에 다음 외부 설정을 적용했습니다. 새 공개 홈페이지 코드의 온라인 반영에는 해당 커밋의 Git 푸시 및 Vercel 배포가 필요합니다. Git 푸시는 운영자가 직접 합니다.

1. Vercel **website-platform** 프로젝트의 Production에 `sites.koofy.co.kr` 연결.
2. 가비아 `koofy.co.kr`에 CNAME `sites` → `5b20872568a02d7b.vercel-dns-017.com.` (TTL 600) 추가. 기존 12개 레코드는 그대로 보존. 향후 Vercel이 안내하는 값이 바뀌면 해당 프로젝트의 Domains 화면을 기준으로 확인.
3. Vercel Production 환경 변수:
   - `APP_URL=https://sites.koofy.co.kr`
   - `PLATFORM_HOSTS=sites.koofy.co.kr,website-platform-one.vercel.app`
   - 기존 Supabase 비밀 환경 변수는 유지. Preview에는 Production 대표 주소를 강제로 적용하지 않음.
4. Supabase Site URL은 `https://sites.koofy.co.kr`. Redirect URLs에 아래 두 주소를 추가하고 기존 테스트/로컬 콜백 주소는 유지:
   - `https://sites.koofy.co.kr/auth/confirm`
   - `https://sites.koofy.co.kr/auth/confirm?flow=recovery`
5. 실제 새 배포 후 홈·가입·로그인·복구·운영자 이동과 `/sitemap.xml`의 대표 도메인을 다시 확인.

Vercel 환경 변수는 다음 배포부터 적용됩니다. 도메인 변경 뒤 브라우저 세션 쿠키는 도메인별로 별개이므로 새 주소에서는 다시 로그인해야 합니다. DB의 기존 계정과 매장 데이터는 공유됩니다.

Supabase SMTP 발신 이름은 `쿠피 · 소상공인 웹사이트 제작`, 발신 주소는 `noreply@auth.koofy.co.kr`입니다. 인증 메일 본문과 제목의 한국어 전환은 아직 남아 있습니다. SMTP 비밀번호는 변경하지 않았습니다.

### 검색 노출과 회사 홈페이지 연결

공개 페이지 6개만 사이트맵에 포함합니다. 고객·운영자·미리보기·인증·API 경로는 noindex이며 Preview 배포 전체도 noindex입니다. 공개 샘플과 고객의 비공개 초안 미리보기는 다른 경로입니다. 색상별 샘플 URL은 하나의 canonical 주소로 모읍니다.

새 코드가 대표 도메인에 배포된 후 Google Search Console과 네이버 서치어드바이저에 대표 주소 소유 확인 및 `https://sites.koofy.co.kr/sitemap.xml` 제출을 진행합니다. 아직 검색 도구 등록이나 실제 색인 완료를 의미하지 않으며 검색 순위는 보장하지 않습니다.

기존 회사 홈페이지의 `/products#projects`에는 아래 링크를 추가하면 됩니다. 기존 회사 홈페이지의 실제 프로젝트를 확인한 뒤 그 저장소에서 변경·배포해야 합니다.

```html
<a href="https://sites.koofy.co.kr/">소상공인 웹사이트 제작 · 내 홈페이지 만들기 ↗</a>
```

### 공개 페이지·로그인 분기 회귀 검증

```bash
npm run build
node --import tsx scripts/marketing-acceptance.ts
```

이 스크립트는 별도 임시 PGlite DB와 `127.0.0.1:3011` 서버에서 실제 로컬 로그인, 고객/운영자 이동, 고객의 운영자 접근 차단, 고객 도메인 분리, 공개 페이지·샘플 색상·SEO를 검증한 뒤 서버와 DB를 정리합니다. 운영 Supabase 계정이나 권한을 수정하지 않습니다. 실제 운영 인증은 새 배포에서 별도로 검증합니다.

제작 사례·가격 데이터는 `components/marketing/content.ts`에서 수정합니다. 공개 가격 비교와 산정 이유, 원본 사례 이미지 출처는 [요금·사례 근거](docs/pricing-basis.md)에 기록합니다.
