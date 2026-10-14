// Old tabs may still have the removed selection button. Do not write a preference.
export async function POST() {
  return Response.json(
    { error: '온라인 시안 선택은 종료되었습니다. 마음에 드는 시안은 문자로 알려주세요.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  );
}
