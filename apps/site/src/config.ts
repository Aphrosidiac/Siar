/** Site-wide settings. Every page, endpoint and legal text reads from here. */
const domain = (typeof process !== 'undefined' && process.env?.SITE_DOMAIN) || 'siar.dev';

export const SITE_NAME = 'Siar';
export const DOMAIN = domain;
export const SITE_URL = `https://${domain}`;
export const API_ORIGIN = `https://api.${domain}`;
export const API_BASE = `${API_ORIGIN}/api/v1`;
export const DASHBOARD_URL = `https://app.${domain}`;
export const SIGNUP_URL = `${DASHBOARD_URL}/signup`;
export const CONTACT_EMAIL = `hello@${domain}`;
export const LEGAL_ENTITY = 'FF DEV STUDIO (202603234793), Malaysia';
export const LEGAL_NAME = 'FF DEV STUDIO';
export const LEGAL_REG = '202603234793';
export const COMPANY_URL = 'https://ffdev.studio';
export const TAGLINE = 'One unified social media API';
export const DESCRIPTION =
  'Siar is one REST API to publish, schedule, comment on and measure social media across 15 networks. Unlimited connected accounts on paid plans, billed per organization, never per account.';
export const LAST_UPDATED = '2026-10-12';
