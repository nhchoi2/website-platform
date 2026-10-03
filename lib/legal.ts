// Change the database's accepted versions in a migration when these documents change.
export const TERMS_VERSION = '2026-10-03';
export const PRIVACY_VERSION = '2026-10-03';
export const legalAcceptance = {
  accepted_terms: true,
  terms_version: TERMS_VERSION,
  privacy_version: PRIVACY_VERSION,
};
