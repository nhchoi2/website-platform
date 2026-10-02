import Link from 'next/link';
export function TemplateVisual() {
  return (
    <div className="m-browser" aria-label="혜화 템플릿 예시 화면">
      <div className="m-browser-bar">
        <span>● ● ●</span>
        <small>우리 가게 홈페이지</small>
        <span>↗</span>
      </div>
      <div className="m-example">
        <div className="m-example-nav">
          <strong>담백한 식탁</strong>
          <span>소개　메뉴　오시는 길</span>
        </div>
        <div className="m-example-hero">
          <div>
            <small>GOOD FOOD, WARM MOMENTS</small>
            <h3>
              좋은 한 끼,
              <br />
              좋은 이야기.
            </h3>
            <p>정성으로 차리는 우리 가게의 하루.</p>
            <span className="m-example-button">메뉴 둘러보기 ↗</span>
          </div>
          <img
            src="/marketing/hyehwa-food.jpeg"
            alt="불판에 구운 삼겹살과 김치"
            width="960"
            height="1280"
          />
        </div>
        <div className="m-example-bottom">
          <span>OUR STORY</span>
          <strong>맛있는 시간, 우리의 이야기</strong>
          <p>음식과 공간에 담긴 마음을 전합니다.</p>
        </div>
      </div>
    </div>
  );
}
export function TemplateCard() {
  return (
    <article className="m-template-card">
      <Link href="/templates/hyehwa" aria-label="혜화 템플릿 전체 예시 보기">
        <TemplateVisual />
      </Link>
      <div className="m-template-caption">
        <div>
          <p className="m-kicker">01 / RESTAURANT</p>
          <h3>혜화 · 담백한 식탁</h3>
          <p>음식과 공간이 먼저 보이는, 차분한 한 페이지.</p>
        </div>
        <Link className="m-round-link" href="/templates/hyehwa" aria-label="혜화 템플릿 둘러보기">
          ↗
        </Link>
      </div>
    </article>
  );
}
