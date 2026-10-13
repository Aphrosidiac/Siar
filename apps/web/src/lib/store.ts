import { computed, reactive, ref } from 'vue';
import { api, setOrganizationId, isApiError } from './api';
import { browserTz } from './format';
import type { AuthMe, NetworkType, Organization, Team, Tier } from './types';

/** Session-wide state: who is signed in, which organization and team they are working in. */
export const session = reactive({
  ready: false,
  me: null as AuthMe | null,
  org: null as Organization | null,
  teams: [] as Team[],
  teamId: null as string | null,
  teamsLoaded: false,
});

const store = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string | null) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

export const currentTeam = computed(() => session.teams.find((t) => t.id === session.teamId) ?? null);
export const currentMembership = computed(() => session.me?.memberships.find((m) => m.organizationId === session.me?.currentOrganizationId) ?? null);
export const role = computed(() => currentMembership.value?.role ?? 'MEMBER');
export const isAdmin = computed(() => role.value === 'OWNER' || role.value === 'ADMIN' || !!session.me?.user.isStaff);
export const isOwner = computed(() => role.value === 'OWNER' || !!session.me?.user.isStaff);
export const timezone = computed(() => session.me?.user.timezone || browserTz());
export const tier = computed<Tier>(() => session.org?.tier ?? currentMembership.value?.tier ?? 'FREE');

export async function loadSession(force = false) {
  if (session.ready && !force) return session.me;
  try {
    const me = await api.get<AuthMe>('/auth/me', undefined, { noAuthRedirect: true });
    session.me = me;
    setOrganizationId(me.currentOrganizationId ?? null);
    if (me.currentOrganizationId) await Promise.all([loadOrg(), loadTeams()]);
  } catch (e) {
    if (!isApiError(e) || e.status !== 401) throw e;
    session.me = null;
  } finally {
    session.ready = true;
  }
  return session.me;
}

export async function loadOrg() {
  session.org = await api.get<Organization>('/organization/');
}

export async function loadTeams() {
  const res = await api.get<{ items: Team[]; total: number }>('/team/', { limit: 100 });
  session.teams = res.items;
  session.teamsLoaded = true;
  const key = `siar.team.${session.me?.currentOrganizationId}`;
  const saved = store.get(key);
  session.teamId = res.items.find((t) => t.id === session.teamId)?.id ?? res.items.find((t) => t.id === saved)?.id ?? res.items[0]?.id ?? null;
}

/** Which networks this server can connect right now (live mode needs each network's app approved). */
export const platforms = ref<Partial<Record<NetworkType, { available: boolean }>> | null>(null);
export async function loadPlatforms() {
  if (platforms.value) return;
  try { platforms.value = (await api.get<{ platforms: typeof platforms.value }>('/', undefined, { noAuthRedirect: true })).platforms; } catch { /* everything shows as connectable */ }
}

export function selectTeam(id: string) {
  session.teamId = id;
  store.set(`siar.team.${session.me?.currentOrganizationId}`, id);
}

/** Replace one team in the list (after connect/disconnect etc.). */
export async function refreshTeam(id = session.teamId) {
  if (!id) return;
  const t = await api.get<Team>(`/team/${id}`);
  const i = session.teams.findIndex((x) => x.id === id);
  if (i >= 0) session.teams.splice(i, 1, t); else session.teams.push(t);
}

export async function switchOrganization(organizationId: string) {
  const me = await api.post<AuthMe>('/auth/switch-organization', { organizationId });
  session.me = me;
  setOrganizationId(me.currentOrganizationId ?? null);
  session.teamId = null;
  await Promise.all([loadOrg(), loadTeams()]);
}

export async function logout() {
  try { await api.post('/auth/logout'); } catch { /* already gone */ }
  session.me = null; session.org = null; session.teams = []; session.teamId = null; session.ready = true;
  setOrganizationId(null);
}

export function setSession(me: AuthMe) {
  session.me = me;
  session.ready = true;
  setOrganizationId(me.currentOrganizationId ?? null);
}

// ── theme ──
export type ThemePref = 'system' | 'light' | 'dark';
export const theme = reactive({ pref: (store.get('siar.theme') as ThemePref) || 'light' });
export function setTheme(p: ThemePref) {
  theme.pref = p;
  store.set('siar.theme', p);
  if (p === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = p;
}
export const storage = store;
