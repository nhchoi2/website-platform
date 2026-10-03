# 업종별 템플릿 안내와 구성 미리보기

`/templates`에서 정보 배치가 서로 다른 7종의 제작 상담용 예시를 제공합니다. 실제 고객 자료가 아닌 예시 브랜드·콘텐츠이며, 업종별 사진 22장은 내장 이미지 생성 도구로 제작한 AI 예시입니다. 기존 혜화 고객 관리·게시 데이터와 별개이고, 용스 원본 프로젝트는 사용하지 않았습니다. 실제 업체 홈페이지를 조사한 근거와 적용 범위는 [참고 기록](template-reference-research.md)에 정리했습니다.

## 화면과 수정 위치

- `templates/catalog/catalog.ts`: 예시 업종·브랜드·메뉴 데이터. `demoContent()`는 디자인과 예시 콘텐츠를 분리.
- `templates/catalog/designs/`: Table / Editorial / Atelier / Motion / Market / Partner / Care의 개별 JSX 구성, 공용 디자인 스타일, 추천 업종과 참고 근거.
- `templates/catalog/TemplateArt.tsx`, `catalog.css`: 직접 만든 그림, 메뉴·방문·푸터 등의 공통 스타일. 기존 혜화 디자인은 `templates/hyehwa/`에 유지.
- `templates/catalog/DesignThumbnail.tsx`, `thumbnails.css`: 각 실제 구성에 맞춘 카탈로그 썸네일.
- `templates/catalog/DemoSite.tsx`, `Visit.tsx`: 페이지 프레임, 디자인 선택, 공통 방문 안내.
- `templates/catalog/images.ts`: 업종별 대표·메뉴·서비스 사진과 대체 텍스트. 정적 예시 파일은 `public/template-images/`, 제작 프롬프트는 `docs/template-image-prompts.json`.
- `templates/catalog/ContentFeatures.tsx`: 갤러리·가격 비교표·담당자·요일별 시간표·공지·이용 절차.
- `templates/catalog/options.ts`: 허용 기능, 페이지 구성, URL 직렬화, 문의 내용, 견적 기준.
- `templates/catalog/CommonFeatures.tsx`: 모든 예시 페이지의 공통 플로팅 버튼. URL 미입력 시 접수가 아닌 예시 안내만 표시.
- `components/marketing/TemplateConfigurator.tsx`: 체크박스, 화면 크기, iframe 미리보기, 링크 복사.
- `app/(marketing)/templates/[slug]/page.tsx`: 검색 노출 가능한 상세보기.
- `app/template-preview/[slug]/[[...section]]/page.tsx`: 검색 제외한 예시 사이트. 고객 초안 미리보기 `/preview`와 다름.

## 페이지와 기능

원페이지는 홈·소개·서비스·방문 정보를 한 주소에서 표시하고 메뉴는 섹션 앵커입니다. 3페이지는 홈+소개 / 서비스 / 방문, 4페이지는 홈 / 소개 / 서비스 / 방문입니다. 3·4페이지 메뉴는 실제 별도 주소로 이동하고, 체크한 옵션은 이동 후에도 URL에 유지됩니다.

업종은 추천 기준이며 디자인 선택을 제한하지 않습니다. 카탈로그의 추천 필터는 해당 업종에 어울리는 여러 디자인을 보여줍니다. 상세보기의 ‘예시 콘텐츠 업종’은 디자인을 유지하면서 브랜드·서비스·사진 예시를 바꿉니다. `business` 쿼리도 페이지 이동과 문의 내용에 유지됩니다.

갤러리·가격 비교표·담당자 소개·요일별 시간표·공지·이용 절차와 플로팅 상담·예약·플레이스·카카오 링크, 상단 배너, FAQ, 맨 위로 버튼을 선택합니다. 선택한 콘텐츠 모듈은 각 페이지 아래에 표시하며 체크 시 해당 영역으로 이동합니다. FAQ는 방문 안내에, 플로팅과 배너는 모든 페이지에 표시합니다. 반응형과 기본 검색 설정은 제작 기본 사항으로 안내하며 체크로 끄지 않습니다.

미리보기 링크에는 공개 예시의 선택 구성과 입력한 외부 주소만 들어갑니다. 비밀키·고객 초안·개인정보를 넣지 않습니다. HTTPS와 인증정보 없는 주소만 링크로 렌더링합니다. 잘못된 주소는 연결하지 않습니다. iframe 메시지는 같은 origin과 정확한 iframe source, 템플릿과 허용 페이지를 검증합니다.

## 견적과 문의 상태

확정한 기준은 기존 원페이지 제작 390,000원부터, 월 관리 33,000원부터(부가세 포함)입니다. 추가 페이지·기능 요금은 아직 미정이라 `quoteSummary`는 추가 견적 필요 여부만 표시하고 미정 가격을 합산하지 않습니다. 실제 가격 확정 후 이 파일을 수정하고 비용 안내도 맞춥니다.

문의는 `koofylab@gmail.com`으로 보내는 mailto입니다. 선택한 템플릿·페이지·기능·외부 주소가 메일 앱에 입력되고 방문자가 직접 보내야 전달됩니다. 문의 DB 저장·자동 발송·결제는 구현하지 않았으며 접수 완료라고 표시하지 않습니다.

고객 편집·승인·게시까지 실제 연결된 것은 기존 혜화 템플릿 1종입니다. 새 6종과 다중 페이지·추가 옵션의 고객 DB/편집/공개 연동은 별도 후속 작업입니다. 카탈로그에서 선택한 옵션을 기존 고객 DB에 몰래 쓰거나 기존 홈페이지에 적용하지 않습니다.

## 검증

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `node --import tsx scripts/marketing-acceptance.ts`. 핵심 테스트는 옵션 주소의 위험한 스킴 차단, 문의 구성 일치, 모든 업종의 페이지 구성과 옵션 유지, 잘못된 페이지 404, 예시 검색 제외, 고객 도메인 격리를 확인합니다. 브라우저에서 체크·메뉴 이동·모바일 화면도 확인합니다.

## 별도 창 미리보기

`/template-preview/...`를 별도 창에서 열면 상단 ‘미리보기 설정’으로 페이지 수, 예시 업종, 모든 콘텐츠·안내 옵션과 외부 연결 주소를 바꿀 수 있습니다. 선택은 URL에 기록되며 메뉴 이동과 새로고침 후 유지됩니다. 4페이지 소개 화면에서 3페이지로 바꾸거나 내부 화면에서 원페이지로 바꾸면 유효한 홈으로 이동합니다. ‘상세보기’로 돌아갈 때도 선택 구성을 전달합니다. 임베드된 iframe 안에서는 별도 설정을 숨기고 원래 상세 화면의 설정을 사용합니다. 구현 위치는 `templates/catalog/StandalonePreviewControls.tsx`와 `preview-controls.css`입니다.

## 옵션의 가격 구분

기본 포함/유료 분류와 미구현 기술 옵션은 [상품 구성 기준](template-option-policy.md)을 참고합니다. `options.ts`의 `cost`가 두 미리보기 화면의 공통 기준입니다. 메뉴 위치(`nav=left|center|right`)와 모바일 메뉴(`mobileNav=expanded|hamburger`)는 기본 포함 선택이며 페이지 이동·새로고침에 유지됩니다. 제공된 로고·탭 아이콘 파일 등록과 지도 API는 아직 연동되지 않았습니다.
