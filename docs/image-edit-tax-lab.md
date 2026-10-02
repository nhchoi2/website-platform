# 택스랩 썸네일 브랜드 정정

- 방식: 내장 image_gen 이미지 편집. 사용자가 이미지 내부의 DK / DKEVIN 표기 교체를 요청함.
- 대상: `public/marketing/projects/tax-lab.webp`
- 원본: 쿠피랩 제작 사례 썸네일. 편집 전 버전은 Git 이력에 보존.
- 범위: 영문 브랜드 표식·상호·브랜드 이메일 정정. 실제 웹사이트나 실제 사무실 간판을 변경한 것은 아님.

## 사용한 프롬프트

```text
Use case: text-localization. Edit target: the supplied existing tax-office website portfolio thumbnail. Correct ONLY the incorrect Latin brand lettering and monograms; preserve the exact overall composition, office photo, desk, plant, lighting, cream and navy color palette, all Korean copy, icons, stats, and image aspect ratio. The correct exact brand is "THE KEVIN'S TAX LAB". Replace the DK monogram at upper left with a clean compact typographic "THE" mark in the same dark navy footprint. Replace the large metallic DK wall monogram in the right-hand office photo with a tasteful metallic "THE" wordmark, matching its perspective, relief, lighting and placement. Replace EVERY instance of "DKEVINZ TAX LAB" or similar DKEVIN lettering with the exact text "THE KEVIN'S TAX LAB": small upper-left subline, large wall signage, and small desk nameplate. Check all three places. Replace the small bottom contact email tax@dkevinz.com with the correct email "akathekevin@thekevinstaxlab.com", fitting it neatly within the same footer contact block. Do not leave any DK / DKEVIN / DKEVINZ Latin lettering anywhere. Preserve the Korean name and all other Korean text unchanged. This is a precision correction to an existing image, not a redesign. No added elements, no new numbers, no watermarks.
```
