# 상담부터 제작·고객 관리까지

## 구현한 흐름

1. 고객은 카탈로그에서 디자인·페이지·옵션을 선택해 상담한다. 로그인한 접수는 해당 계정에 기록되며 익명 접수는 운영자가 고객 확인 후 계정에 연결한다. 이름/연락처가 같다는 이유로 다른 사람에게 상담을 자동 연결하지 않는다.
2. 운영자는 `/admin/sites/new`에서 가입 고객을 선택하고 새 사이트를 생성하거나 기존 사이트를 연결한다. 계정 하나당 사이트 하나를 유지한다. 고객이 직접 초안을 만들 수도 있다. 상담 구성은 초안의 페이지·옵션에 반영되며 고객 사이트에는 예시 상호·가격·사진을 복사하지 않는다.
3. 고객과 운영자는 제작 단계/견적/공개 안내/이력을 확인하고 제작 자료를 비공개로 전달한다. 고객에게 보여 줄 안내와 운영자 전용 상담 메모는 분리한다. 견적 확인 버튼은 읽음 기록이며 계약/결제가 아니다.
4. 운영자는 고객 사이트를 제작·편집하고 제출한다. 고객도 계속 초안을 수정할 수 있다. 제출본의 공지·사진·로고·아이콘·옵션과 1/3/4페이지가 함께 고정된다.
5. 운영자는 제출본을 미리 보고 승인한다. 파일 존재 검사를 통과한 제출본만 원자적으로 게시한다. 게시/복구 이력에 연결된 제작 진행은 공개 완료로 갱신된다. 다른 고객·알 수 없는 도메인에는 데이터와 파일을 반환하지 않는다.

## 현재 운영 상태와 적용 순서

코드/로컬 검증과 실제 운영 검증은 다르다. 2026-10-03 사용자 승인 후 website-platform 운영 Supabase에 006~009를 하나의 트랜잭션으로 적용했다. 신규 테이블 5개의 RLS 활성화, 두 저장소의 비공개 설정, 익명/고객 직접 상담 접수 RPC 차단과 서버 실행 권한을 SQL로 확인했다. 신규 테이블의 익명 REST 조회도 모두 401/42501로 차단됐다. 기존 001~009는 다시 실행하지 않는다. 새 기능의 운영 화면 검증은 새 코드 배포 후 수행해야 한다.

1. 새 Supabase 프로젝트에 구축할 때만 기존 001~005 다음에 `006_managed_templates.sql`, `007_customer_workflow.sql`, `008_workflow_storage.sql`, `009_notifications.sql`을 순서대로 하나의 트랜잭션으로 적용한다. 실패하면 전체 rollback한다. 기존 고객 데이터·제출본·공개 이력을 삭제하지 않는다. 현재 운영 프로젝트에는 적용 완료했다.
2. 008은 Storage schema가 있는 Supabase에만 적용한다. 기존 `restaurant-images`는 비공개를 유지하고 WebP와 PDF만 허용한다. 새 `project-files`는 비공개, 3MB/파일, 직접 업로드·변경·삭제 정책 없이 서버 경유로 관리한다.
3. 사용자가 GitHub에 커밋·푸시하고 새 website-platform Vercel 배포를 확인한다. 기존 혜화·용스 저장소는 변경하지 않는다.
4. 실제 개인정보 처리 주체·보관/삭제 절차·Supabase/Vercel/Resend 처리·전송 조건과 상담 안내를 확인한 뒤 `INQUIRIES_ENABLED=true`. 새 가입/구글 로그인 활성화는 기존 `LEGAL_PUBLISHED`와 Google provider 확인 절차를 따른다. 키 존재만으로 법적 검토 완료나 OAuth 성공을 간주하지 않는다.
5. 실제 운영 계정/테스트 고객으로 접수 → 계정 연결 → 초안 → 자료 → 검수 → 공개를 검증한다. 로컬 시연 성공을 운영 연결 성공으로 보고하지 않는다.

## 메일 알림

서버 환경 변수:

- `NOTIFICATIONS_ENABLED=true`: 실제 자동 발송 활성화. 기본 false.
- `RESEND_API_KEY`: 인증된 발신 도메인에 메일을 보낼 수 있는 서버 키. 채팅/Git/NEXT_PUBLIC에 넣지 않는다.
- `NOTIFICATION_FROM`: 예: `쿠피 <noreply@auth.koofy.co.kr>`. 현재 인증된 도메인과 발신 권한을 확인한다.
- `NOTIFICATION_ADMIN_EMAIL=koofylab@gmail.com`, `NOTIFICATION_REPLY_TO=koofylab@gmail.com`.

2026-10-03 `website-platform-notifications` 발송 전용 키를 생성했다. 범위는 `auth.koofy.co.kr` 한 도메인이다. Vercel website-platform Production에 `RESEND_API_KEY`, `NOTIFICATIONS_ENABLED=true`, `NOTIFICATION_FROM=쿠피 <noreply@auth.koofy.co.kr>`를 Secret 타입으로 저장하고 새로고침 후 존재를 확인했다. 환경 변수는 다음 배포부터 반영된다. 키는 Git 제외 `.env.local`(권한 600)에도 보관하며 로컬의 실제 메일 발송 플래그는 false다. 실제 알림 발송/수신 테스트는 아직 수행하지 않았다.

접수 저장과 알림 대기열 생성은 같은 DB 트랜잭션이다. 접수 응답 후 발송하며 실패해도 원래 접수는 유지한다. 관리자에게 새 상담 알림, 이메일 연락을 선택한 고객에게 접수 확인, 연결 고객에게 제작 진행 변경 안내를 보낸다. 메일에 상담 본문·파일·증빙 번호는 포함하지 않는다. 발송 공급자 접수 성공과 실제 받은편지함 배달은 다르다. 자동 발송 활성화 전 테스트 메일의 수신/반송을 확인한다.

Resend에 동일 job ID의 `Idempotency-Key`를 전달한다. 동시에 처리하는 요청은 DB lease로 나눈다. 요청 하나는 최대 2건을 처리해 서버 실행 시간을 제한하며, 남은 건은 다음 요청이나 운영자 재처리로 처리한다. 최대 5번, 최초 시도 23시간 이내에만 자동 재처리해 공급자의 24시간 중복 방지 범위를 넘기지 않는다. 오래된 미확인 건은 공급자 로그에서 확인한다. 새 요청/진행 변경 또는 `/admin/notifications` 재처리 버튼이 큐를 처리하며 현재 별도 정기 작업은 없다. 개인정보 파기 시 관련 상담 큐는 cascade 삭제한다.

근거: [Resend 메일 API](https://resend.com/docs/api-reference/emails/send-email), [중복 방지 키](https://resend.com/docs/dashboard/emails/idempotency-keys).

## 지도

`GOOGLE_MAPS_EMBED_KEY`를 설정하면 고객이 지도 표시를 선택한 주소/장소를 Google Maps Embed API의 place iframe으로 표시한다. 미설정이면 주소만 표시하고 실제 지도 연결 완료라고 안내하지 않는다. API 제품·계정 설정·사용량은 운영자가 확인하며 자동으로 과금 계정이나 API 키를 만들지 않는다. 지도 iframe 키는 브라우저에서 보이는 웹용 키이므로 인증용 비밀키로 취급하거나 서버 키를 재사용하면 안 된다. Embed API만 허용하고 실제 고객 도메인 HTTP referrer 제한을 설정한다. 새 고객 도메인마다 허용 목록을 관리한다.

근거: [Google 지도 삽입](https://developers.google.com/maps/documentation/embed/embedding-map), [키 보호](https://developers.google.com/maps/api-security-best-practices).

## 증빙과 문자

고객의 명시적 별도 동의를 기록하고 증빙 요청·외부 발행 번호/결과를 관리한다. 자동 발행·결제·세무 적격성 판정은 하지 않는다. 발행 완료 기록에는 외부 발행 번호가 필수다. 발행 전 고객이 철회하면 번호·신청인·이메일을 제거한다. 발행 후의 실제 보관 의무와 개인정보 삭제 요청은 운영자가 확인해야 한다. 사업자 등록 전 실제 발행 완료로 표시하면 안 된다.

문자 서비스 연결은 사용자가 추후 진행하기로 했다. 담당자 번호 등록은 제공하지만 문자 인증/통신사 본인확인 완료로 표시하지 않는다.

## 주요 수정 위치와 유지보수

- `lib/content.ts`: 저장/제출/공개 공통 콘텐츠 규격, 참조 파일과 변경 비교.
- `templates/shared/SiteRenderer.tsx`, `CustomerFeatures.tsx`: 실제 고객 데이터 렌더링. `templates/catalog/designs`의 7종 디자인 재사용. 예시 렌더링과 구분.
- `components/dashboard/AdditionalEditor.tsx`: 페이지/옵션/로고/담당자/FAQ/공지 편집.
- `components/projects`: 제작 진행, 자료, 증빙 화면.
- `lib/server/notifications.ts`: Resend 발송. `009_notifications.sql`: 큐·lease·중복 방지.
- DB 변경은 새 번호 migration으로 기록한다. 적용된 파일을 다시 고치지 않는다.

제작 자료는 최대 50개/제작 건, 공지 최대 50개·첨부 5개/글, 전체 콘텐츠 150KB 이하다. 파일은 새 ID로 저장해 공개 원본을 덮어쓰지 않는다. 계정 간 저장소와 서버 권한을 모두 검사한다. PDF는 다운로드로만 반환하며 HTML/SVG/실행 파일을 받지 않는다. 게시판은 현재 승인된 콘텐츠 안의 목록/펼치기/검색이며 방문자 댓글·글쓰기는 없다.

## 백업·복구

기존 DB 백업에 projects/project_events/project_files/evidence_requests/notification_jobs를 포함한다. 제작 자료 실제 파일은 `project-files` bucket을 별도로 백업한다. 기존 관리자 사이트 ZIP은 콘텐츠와 사이트 assets(WebP/PDF)를 포함하지만 제작 자료/증빙 개인정보는 포함하지 않는다. 로컬 전체 백업은 LOCAL_DATA_DIR의 DB와 project-uploads를 포함한다. 공개 버전 복구는 기존 운영자 화면에서 수행한다. 파기한 자료·증빙을 백업 복구 후 다시 서비스에 노출하지 않도록 삭제 기록/복구 확인 절차를 별도 관리한다.
