import 'server-only';
import { createHash } from 'node:crypto';
import { cache } from 'react';
import { headers } from 'next/headers';
import { isPlatformHost } from '../hosts';
import {
  proposalTokenSchema,
  proposalContentSchema,
  type ProposalRecord,
  type ProposalPhotos,
} from '../proposals';
import { rpc } from './data';
import { mode } from './config';
import { storageService } from './supabase';

export function proposalHash(token: string) {
  return createHash('sha256').update(proposalTokenSchema.parse(token)).digest('hex');
}
export const getProposal = cache(async (token: string): Promise<ProposalRecord | null> => {
  if (
    !proposalTokenSchema.safeParse(token).success ||
    !isPlatformHost((await headers()).get('host') || '')
  )
    return null;
  const data = await rpc<ProposalRecord | null>(null, 'get_design_proposal', {
    p_hash: proposalHash(token),
  });
  if (!data) return null;
  const content = proposalContentSchema.safeParse(data.content);
  return content.success ? { ...data, content: content.data } : null;
});
export function proposalImagePath(proposalId: string, imageId: string, size: 'small' | 'full') {
  return `${proposalId}/${imageId}/${size}.webp`;
}
export async function getProposalPhotos(
  record: ProposalRecord,
  token: string,
): Promise<ProposalPhotos> {
  const images = record.content.images;
  if (mode() === 'local')
    return Object.fromEntries(
      images.map((image) => [
        image.id,
        {
          ...image,
          small: `/api/proposal-images/${token}/${image.id}?size=small`,
          src: `/api/proposal-images/${token}/${image.id}?size=full`,
          smallFallback: `/api/proposal-images/${token}/${image.id}?size=small`,
          fullFallback: `/api/proposal-images/${token}/${image.id}?size=full`,
        },
      ]),
    );
  const paths = images.flatMap((image) => [
    proposalImagePath(record.id, image.id, 'small'),
    proposalImagePath(record.id, image.id, 'full'),
  ]);
  const { data, error } = await storageService('proposal-images').createSignedUrls(paths, 600);
  if (error || !data || data.some((item) => item.error || !item.signedUrl))
    throw new Error('시안 사진을 불러오지 못했습니다.');
  const urls = new Map(data.map((item) => [item.path, item.signedUrl]));
  return Object.fromEntries(
    images.map((image) => [
      image.id,
      {
        ...image,
        small: urls.get(proposalImagePath(record.id, image.id, 'small'))!,
        src: urls.get(proposalImagePath(record.id, image.id, 'full'))!,
        smallFallback: `/api/proposal-images/${token}/${image.id}?size=small`,
        fullFallback: `/api/proposal-images/${token}/${image.id}?size=full`,
      },
    ]),
  );
}
