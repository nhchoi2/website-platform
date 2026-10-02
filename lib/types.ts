import type { Content } from './content';
export type User = { id: string; email: string; admin: boolean };
export type Site = {
  id: string;
  owner_id: string;
  slug: string;
  draft: Content;
  draft_version: number;
  published_revision: string | null;
  created_at: string;
  updated_at: string;
};
export type Revision = {
  id: string;
  site_id: string;
  content: Content;
  draft_version: number;
  created_at: string;
};
export type Submission = {
  id: string;
  site_id: string;
  revision_id: string;
  status: 'pending' | 'changes_requested' | 'published';
  feedback: string;
  created_at: string;
  reviewed_at: string | null;
};
export type Publication = {
  id: string;
  revision_id: string;
  kind: 'approval' | 'restore';
  created_at: string;
  actor_id: string;
};
export type Asset = {
  id: string;
  site_id: string;
  owner_id: string;
  path: string;
  bytes: number;
  original_name: string;
  created_at: string;
};
export type Domain = {
  hostname: string;
  site_id: string;
  status: 'pending' | 'connected' | 'error';
  expires_on: string | null;
  notes: string;
  updated_at: string;
};
export type SiteDetail = {
  site: Site;
  revisions: Revision[];
  submissions: Submission[];
  publications: Publication[];
  assets: Asset[];
  domains: Domain[];
  owner_email: string;
};
export type SiteSummary = {
  id: string;
  slug: string;
  name: string;
  email: string;
  updated_at: string;
  published_revision: string | null;
  pending: boolean;
};
