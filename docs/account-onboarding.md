# 가입·동의·담당자 정보

## 구현 구조

- 이메일 회원가입: 필수 체크박스를 서버에서도 확인. Supabase Auth의 새 계정 생성 트리거에서 문서 버전·서버 시각·가입 경로를 기록. 이메일 인증 이후 사용.
- 구글 로그인: 같은 Supabase Auth의 OAuth 사용. Google 프로젝트는 Firebase에서 생성한 `website-platform-312c7`을 재사용하며 Firebase Auth로 계정 시스템을 이전하지 않음. 서버에서 OAuth 시작 → `/auth/confirm`에서 PKCE 코드 교환 → 계정 이동.
- 구글 첫 가입·기존 계정: `/account/consent`에서 실제 동의. 최신 문서에 동의하지 않으면 고객·운영자 화면과 관리 API가 차단됨(약관 공개 활성화 이후).
- `/account/settings`: 담당자 이름·전화번호를 선택 등록·삭제. 필수 이메일 및 동의 기록 확인. 연락처 수집에 별도 선택 동의. 정보를 비우고 저장하면 연락처와 현재 선택 동의 시각 제거.
- `/admin/[id]`: 해당 매장 담당자 연락 정보를 운영자에게만 표시.
- `account_details`: 공개 홈페이지 콘텐츠와 분리. 소유자·기존 운영자만 읽음. 임의 고객 ID로 쓰는 API 없음. 변경은 소유자 RPC만 가능.
- `account_consents`: 문서 버전과 최초 동의 시각 기록. 중복 동의는 같은 기록 유지. 사용자 직접 수정·삭제 불가. Auth metadata를 나중에 바꿔도 이력에 영향 없음.

## 외부 설정과 현재 제한

1. `004_accounts_and_consent.sql`은 2026-10-03 운영 Supabase에 트랜잭션으로 적용함. 기존 계정·매장·사진은 유지.
2. Google OAuth 등록·클라이언트 생성·Supabase provider 연결은 사용자 승인과 실제 콘솔 설정을 완료해야 함. Google Cloud에서 웹 클라이언트 사용. 기본 이메일·프로필·openid 범위만 요청.
3. Google 승인 리디렉션 URI: `https://azumnxmjpbzxqvbvsgcc.supabase.co/auth/v1/callback`. 앱으로 돌아오는 주소는 기존 허용된 `/auth/confirm`을 재사용. 앱에서 임의 외부 주소로 리디렉션하지 않음.
4. OAuth Client Secret은 Supabase Google provider 설정에서만 저장. Git, 브라우저 클라이언트 코드, 채팅에 노출하지 않음. 코드에는 별도 Firebase SDK나 공개 비밀키 불필요.
5. `GOOGLE_AUTH_ENABLED=true`는 실제 provider 연결·검증 완료 후 설정. 기본은 비활성. 로컬 시연에서는 항상 구글 로그인 비활성.
6. `LEGAL_PUBLISHED=true`는 운영자·처리 위탁·국외이전 조건과 약관을 확정한 뒤 설정. Supabase 모드에서 기본 false이며 새 가입·구글 로그인·새 약관 동의 API가 차단됨. 기존 이메일 로그인과 기존 서비스 접근은 유지. 약관 초안의 링크는 열람 가능.
7. 공개 사업자 정보는 `SERVICE_OPERATOR_NAME`, `SERVICE_OPERATOR_ADDRESS`, `SERVICE_OPERATOR_NUMBER`, `PRIVACY_CONTACT_NAME` 서버 환경 변수. 문의 이메일은 기존 `koofylab@gmail.com`. 현재 문서 초안의 외부 처리 위치·위탁/국외이전 조건은 실제 공급자 계약·설정을 확인해 확정해야 함. 부정확한 정보로 채우고 활성화하지 말 것.
8. 문자 인증·통신사 본인확인·증빙 발행·결제 연동은 구현하지 않음. 전화번호는 등록 상태이며 인증 완료 표시나 인증 시각을 만들지 않음. 현금영수증 발급용 번호도 아직 수집하지 않음.

## 유지보수·검증

- 가입 UI: `components/auth/AuthForm.tsx`.
- 동의·담당자 UI: `components/account/`, `app/account/`.
- 서버 처리: `app/api/auth/[action]/route.ts`, `app/api/account/[action]/route.ts`.
- 안내 문서: `app/(marketing)/terms/page.tsx`, `privacy/page.tsx`.
- 문서 버전: `lib/legal.ts`와 DB 함수의 허용 버전. 변경 시 새 마이그레이션으로 함께 올리고 이전 문서 소스는 Git 이력에 보존. 앱과 DB가 다른 버전이면 동의 요청을 거절.
- `npm test`: 기존 검수·게시 테스트 및 새 동의·RLS·연락처 삭제·재시작 영속성 테스트.
- `node --import tsx scripts/marketing-acceptance.ts`: 격리된 DB와 서버에서 가입 체크 누락 거절, 미동의 접근 차단, 동의 저장, 연락처 재로그인 유지, 역할 분기와 고객 도메인 분리 검증.
- `node --env-file=.env.local --import tsx scripts/accounts-remote-acceptance.ts`: 기존 `.test-data/remote-accounts.json`의 격리 QA 계정만 사용. 실제 Supabase 연락처·동의 저장과 교차 접근 차단 확인 후 테스트 연락처 비움. 이메일·문자·Google 실제 로그인 검증을 대신하지 않음.

가입 동의나 선택 개인정보 동의는 Google의 로그인 권한 승인과 별개입니다. 고객에게 받은 동의가 Google 앱 설정이나 운영자의 공급자 계약 동의를 대신하지 않습니다.
