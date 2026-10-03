import type { Template } from './catalog';
import type { PreviewOptions } from './options';
export function Visit({ template, options }: { template: Template; options: PreviewOptions }) {
  return (
    <section id="visit" className="t-section">
      <div className="t-section-heading">
        <div>
          <p className="t-eyebrow">COME SAY HELLO</p>
          <h2>방문·문의 안내</h2>
        </div>
        <p>방문 전 필요한 정보를 한곳에서.</p>
      </div>
      <div className="t-visit-grid">
        <div className="t-map-art" role="img" aria-label="실제 위치가 아닌 예시 지도">
          <span>⌖</span>
          <strong>{template.brand}</strong>
          <small>실제 위치를 표시하지 않는 예시 지도</small>
        </div>
        <dl>
          <div>
            <dt>주소</dt>
            <dd>실제 매장 주소가 들어갑니다.</dd>
          </div>
          <div>
            <dt>연락처</dt>
            <dd>실제 연락처가 들어갑니다.</dd>
          </div>
          <div>
            <dt>운영시간</dt>
            <dd>평일 10:00–19:00 · 예시 운영시간</dd>
          </div>
          <div>
            <dt>휴무·주차</dt>
            <dd>정기 휴무와 주차 안내를 입력합니다.</dd>
          </div>
        </dl>
      </div>
      {options.features.includes('faq') && (
        <div className="t-faq">
          <h3>자주 묻는 질문</h3>
          {[
            [
              '방문 전에 확인할 내용이 있나요?',
              '운영시간과 휴무를 확인하고 필요한 경우 전화나 외부 예약 서비스를 이용해 주세요.',
            ],
            [
              '주차 안내는 어디서 확인하나요?',
              '실제 제작 시 매장의 주차 위치와 이용 조건을 안내합니다.',
            ],
            [
              '이 화면에서 예약할 수 있나요?',
              '템플릿 예시입니다. 실제 예약은 접수되지 않으며, 고객의 예약 서비스 링크를 연결할 수 있습니다.',
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span>＋</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
