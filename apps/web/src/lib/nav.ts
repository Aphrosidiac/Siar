import type { Component } from 'vue';
import {
  BarChart3, Bot, Calendar, CreditCard, FileUp, Image, Inbox, KeyRound, Link2, MapPin, Send, Settings, Share2, UserCircle, Users, Webhook,
} from 'lucide-vue-next';

export interface NavItem { to: string; label: string; icon: Component; badge?: 'unread' }
export interface NavGroup { group?: string; items: NavItem[] }

/** The sidebar, the page eyebrows and the ⌘K palette all read this. */
export const NAV: NavGroup[] = [
  { items: [
    { to: '/posts', label: 'Posts', icon: Send },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/inbox', label: 'Inbox', icon: Inbox },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ] },
  { group: 'Channels', items: [
    { to: '/social-accounts', label: 'Social accounts', icon: Share2 },
    { to: '/media', label: 'Media library', icon: Image },
    { to: '/bio', label: 'Link in bio', icon: Link2 },
    { to: '/google-business', label: 'Google Business', icon: MapPin },
    { to: '/bots', label: 'Bots', icon: Bot },
  ] },
  { group: 'Developers', items: [
    { to: '/api-keys', label: 'API keys', icon: KeyRound },
    { to: '/webhooks', label: 'Webhooks', icon: Webhook },
    { to: '/bulk', label: 'Bulk post', icon: FileUp },
  ] },
  { group: 'Organization', items: [
    { to: '/team-settings', label: 'Team', icon: Users },
    { to: '/billing', label: 'Billing', icon: CreditCard },
    { to: '/organization', label: 'Settings', icon: Settings },
  ] },
];
export const NAV_FOOT: NavItem[] = [{ to: '/settings', label: 'Your account', icon: UserCircle }];

/** Eyebrow for a path: its sidebar group ("Publishing" for the ungrouped top block). */
export function sectionOf(path: string) {
  if (path.startsWith('/compose')) return 'Publishing';
  if (path.startsWith('/notifications') || path.startsWith('/settings')) return 'You';
  for (const g of NAV) if (g.items.some((i) => path === i.to || path.startsWith(`${i.to}/`))) return g.group ?? 'Publishing';
  return '';
}
