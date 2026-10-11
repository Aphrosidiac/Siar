import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { loadSession, session } from '@/lib/store';
import { setUnauthenticatedHandler } from '@/lib/api';

const views = import.meta.glob('./views/**/*.vue') as Record<string, () => Promise<any>>;
const view = (name: string) => views[`./views/${name}.vue`]!;

/** `auth: false` pages work signed out. `guest` pages bounce signed-in people into the app. */
const app: RouteRecordRaw[] = [
  { path: '/', redirect: '/posts' },
  { path: '/posts', component: view('Posts'), meta: { title: 'Posts', key: 'posts' } },
  { path: '/posts/:id', component: view('Posts'), meta: { title: 'Posts', key: 'posts' } },
  { path: '/compose', component: view('Composer'), meta: { title: 'Composer' } },
  { path: '/compose/:id', component: view('Composer'), meta: { title: 'Edit post' } },
  { path: '/calendar', component: view('Calendar'), meta: { title: 'Calendar' } },
  { path: '/social-accounts', component: view('Accounts'), meta: { title: 'Social accounts' } },
  { path: '/media', component: view('Media'), meta: { title: 'Media library' } },
  { path: '/analytics', component: view('Analytics'), meta: { title: 'Analytics' } },
  { path: '/inbox', component: view('Inbox'), meta: { title: 'Inbox' } },
  { path: '/bio', component: view('Bio'), meta: { title: 'Link in bio' } },
  { path: '/google-business', component: view('GoogleBusiness'), meta: { title: 'Google Business' } },
  { path: '/bots', component: view('Bots'), meta: { title: 'Bots' } },
  { path: '/team-settings', component: view('TeamSettings'), meta: { title: 'Team settings' } },
  { path: '/api-keys', component: view('ApiKeys'), meta: { title: 'API keys' } },
  { path: '/webhooks', component: view('Webhooks'), meta: { title: 'Webhooks' } },
  { path: '/bulk', component: view('Bulk'), meta: { title: 'Bulk post' } },
  { path: '/billing', component: view('Billing'), meta: { title: 'Billing' } },
  { path: '/organization', component: view('OrgSettings'), meta: { title: 'Organization settings' } },
  { path: '/notifications', component: view('Notifications'), meta: { title: 'Notifications' } },
  { path: '/settings', component: view('PersonalSettings'), meta: { title: 'Settings' } },
];

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
  routes: [
    { path: '/login', component: view('auth/Login'), meta: { guest: true, title: 'Sign in' } },
    { path: '/signup', component: view('auth/Signup'), meta: { guest: true, title: 'Create account' } },
    { path: '/forgot-password', component: view('auth/Forgot'), meta: { public: true, title: 'Forgot password' } },
    { path: '/reset-password', component: view('auth/Reset'), meta: { public: true, title: 'Reset password' } },
    { path: '/verify-email', component: view('auth/VerifyEmail'), meta: { public: true, title: 'Verify email' } },
    { path: '/accept-invite', component: view('auth/AcceptInvite'), meta: { public: true, title: 'Accept invitation' } },
    { path: '/connect/:token', component: view('Portal'), meta: { public: true, title: 'Connect your accounts' } },
    { path: '/', component: () => import('./layouts/AppLayout.vue'), children: app },
    { path: '/:rest(.*)*', component: view('NotFound'), meta: { public: true, title: 'Not found' } },
  ],
});

setUnauthenticatedHandler(() => {
  session.me = null;
  const cur = router.currentRoute.value;
  if (!cur.meta.public && !cur.meta.guest) void router.replace({ path: '/login', query: { next: cur.fullPath } });
});

router.beforeEach(async (to) => {
  const me = await loadSession();
  if (to.meta.guest && me) return typeof to.query.next === 'string' && to.query.next.startsWith('/') ? to.query.next : '/posts';
  if (!to.meta.public && !to.meta.guest && !me) return { path: '/login', query: to.fullPath !== '/' ? { next: to.fullPath } : {} };
});

router.afterEach((to) => {
  const t = to.meta.title as string | undefined;
  document.title = t ? `${t} · Siar` : 'Siar';
});
