import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { proposalRoute, proposalStyles } from '@/lib/proposals';
import { getProposal, getProposalPhotos } from '@/lib/server/proposals';
import { ProposalSite } from '@/templates/proposals/ProposalSite';
import { Chooser } from '@/templates/proposals/Chooser';
type Props = { params: Promise<{ token: string; segments?: string[] }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token, segments } = await params;
  const route = proposalRoute(segments);
  const proposal = await getProposal(token);
  const style = proposalStyles.find((s) => s.id === route?.style);
  return {
    title: {
      absolute: proposal
        ? `${proposal.content.shortName} · ${style ? `시안 ${style.letter} ${style.name}` : '홈페이지 디자인 제안'}`
        : '디자인 제안',
    },
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
  };
}
export default async function Page({ params }: Props) {
  const { token, segments } = await params;
  const route = proposalRoute(segments);
  if (!route) notFound();
  const proposal = await getProposal(token);
  if (!proposal) notFound();
  const photos = await getProposalPhotos(proposal, token);
  return route.style ? (
    <ProposalSite
      proposal={proposal}
      photos={photos}
      token={token}
      style={route.style}
      page={route.page}
    />
  ) : (
    <Chooser proposal={proposal} photos={photos} token={token} />
  );
}
