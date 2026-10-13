import { SITE_URL, SITE_NAME, DESCRIPTION, LEGAL_NAME, LEGAL_REG, COMPANY_URL, CONTACT_EMAIL } from '../config';
import { PLANS, TIERS } from './plans';

const strip = (s: string) => s.replace(/<[^>]+>/g, '');

/** Stable ids so every page's JSON-LD resolves to the same three entities. */
export const ORG_ID = `${SITE_URL}/#org`;
export const COMPANY_ID = `${SITE_URL}/#ffdevstudio`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const APP_ID = `${SITE_URL}/#app`;

export const orgLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  description: DESCRIPTION,
  email: CONTACT_EMAIL,
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: CONTACT_EMAIL, availableLanguage: ['en', 'ms'] },
  parentOrganization: {
    '@type': 'Organization',
    '@id': COMPANY_ID,
    name: LEGAL_NAME,
    legalName: LEGAL_NAME,
    url: COMPANY_URL,
    identifier: LEGAL_REG,
    address: { '@type': 'PostalAddress', addressCountry: 'MY' },
  },
});

export const websiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  alternateName: 'siaran.my',
  url: SITE_URL,
  inLanguage: 'en',
  publisher: { '@id': ORG_ID },
});

export const faqLd = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: strip(i.a) } })),
});

export const breadcrumbLd = (crumbs: { name: string; href: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE_URL}${c.href}` })),
});

/** `offers: 'free'` where a page shows only the Free plan, so the markup never states a price the reader can't see. */
export const softwareLd = ({ offers = 'all' }: { offers?: 'all' | 'free' } = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': APP_ID,
  name: SITE_NAME,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  description: DESCRIPTION,
  publisher: { '@id': ORG_ID },
  offers: TIERS.filter((t) => PLANS[t].priceMonthlyCents !== null && (offers === 'all' || PLANS[t].priceMonthlyCents === 0)).map((t) => ({
    '@type': 'Offer',
    name: PLANS[t].name,
    price: ((PLANS[t].priceMonthlyCents ?? 0) / 100).toFixed(2),
    priceCurrency: 'USD',
    url: `${SITE_URL}/pricing`,
  })),
});

export const articleLd = (a: { title: string; description: string; date: string; path: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: a.title,
  description: a.description,
  datePublished: a.date,
  dateModified: a.date,
  image: `${SITE_URL}/og.png`,
  author: { '@type': 'Organization', '@id': COMPANY_ID, name: LEGAL_NAME, url: COMPANY_URL },
  publisher: { '@id': ORG_ID },
  about: { '@id': APP_ID },
  mainEntityOfPage: `${SITE_URL}${a.path}`,
});
