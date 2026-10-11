import { SITE_URL, SITE_NAME, DESCRIPTION, LEGAL_NAME } from '../config';
import { PLANS, TIERS } from './plans';

const strip = (s: string) => s.replace(/<[^>]+>/g, '');

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

export const softwareLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  description: DESCRIPTION,
  publisher: { '@type': 'Organization', name: LEGAL_NAME },
  offers: TIERS.filter((t) => PLANS[t].priceMonthlyCents !== null).map((t) => ({
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
  author: { '@type': 'Organization', name: LEGAL_NAME },
  publisher: { '@type': 'Organization', name: SITE_NAME },
  mainEntityOfPage: `${SITE_URL}${a.path}`,
});
