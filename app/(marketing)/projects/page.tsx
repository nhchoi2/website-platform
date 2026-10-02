import Link from 'next/link';
import { PageIntro, StartCTA } from '@/components/marketing/SiteShell';
import { projects } from '@/components/marketing/content';
import { marketingMetadata } from '@/lib/server/marketing';

export const metadata = marketingMetadata(
  '웹사이트 제작 사례',
  "THE KEVIN'S TAX LAB, 용스 다이닝, Oren Gym과 인트라넷 콘셉트. 쿠피랩의 웹사이트 제작 사례와 서비스 디자인을 살펴보세요.",
  '/projects',
);
export default function Projects() {
  return (
    <main id="main" className="m-container">
      <PageIntro label="SELECTED WORKS / KOOFY LAB" title="다양한 가게, 저마다의 이야기.">
        쿠피랩의 웹사이트 제작 사례를 소개합니다.
        <br />각 브랜드의 분위기와 필요한 정보를 어떻게 담았는지 살펴보세요.
      </PageIntro>
      <div className="m-projects-grid">
        {projects.map((project, index) => (
          <article className="m-case" key={project.slug}>
            <a
              className="m-case-image"
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.name} 자세히 보기 — 쿠피랩, 새 창`}
            >
              <img
                src={project.image}
                alt={project.alt}
                width="640"
                height="427"
                loading={index < 2 ? 'eager' : 'lazy'}
              />
              <span aria-hidden="true">↗</span>
            </a>
            <div className="m-case-caption">
              <p className="m-kicker">{project.category}</p>
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              {'statusNote' in project && <p>{project.statusNote}</p>}
              <a
                className="m-text-link"
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                자세히 보기 <span aria-hidden="true">↗</span>
                <span className="m-visually-hidden">
                  {' '}
                  — {project.name}, 쿠피랩에서 새 창으로 열기
                </span>
              </a>
            </div>
          </article>
        ))}
      </div>
      <aside className="m-projects-note">
        <p>
          쿠피랩에 소개된 제작 사례와 콘셉트입니다. 직접 만들기에서 선택할 수 있는 템플릿은 현재
          혜화 1종입니다.
        </p>
        <Link className="m-text-link" href="/templates">
          제공 템플릿 살펴보기 ↗
        </Link>
      </aside>
      <StartCTA />
    </main>
  );
}
