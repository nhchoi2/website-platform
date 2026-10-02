import { SiteShell } from '@/components/marketing/SiteShell';
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
