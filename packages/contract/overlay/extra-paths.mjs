// Operations that exist only on Siar's side of the contract: dashboard sign-in, members,
// API keys, webhooks, notifications, link-in-bio, billing and the hosted connect portal.
// bundle.social names these resource groups in its llms.txt but does not publish their shapes,
// so these are ours. Every path stays under /api/v1 so one client covers everything.

const S = {
  str: { type: 'string' },
  strN: { type: 'string', nullable: true },
  int: { type: 'integer' },
  bool: { type: 'boolean' },
  date: { type: 'string', format: 'date-time' },
  dateN: { type: 'string', format: 'date-time', nullable: true },
  json: { type: 'object', additionalProperties: true },
};
const obj = (properties, required = []) => ({ type: 'object', properties, required });
const arr = items => ({ type: 'array', items });
const list = item => obj({ items: arr(item), total: S.int }, ['items', 'total']);
const ok = obj({ success: S.bool }, ['success']);
const idParam = { name: 'id', in: 'path', required: true, schema: S.str };
const q = (name, schema = S.str, required = false) => ({ name, in: 'query', required, schema });
const page = [q('offset', { type: 'integer', minimum: 0 }), q('limit', { type: 'integer', minimum: 1, maximum: 100 })];

const op = (operationId, tags, summary, { body, params = [], res = ok, code = '200', security, description } = {}) => {
  const o = { operationId, tags: [tags], summary, parameters: params, responses: { [code]: { description: 'OK', content: { 'application/json': { schema: res } } } } };
  if (body) o.requestBody = { required: true, content: { 'application/json': { schema: body } } };
  if (security) o.security = security;
  if (description) o.description = description;
  return o;
};
const PUBLIC = [];

// ── shapes ──────────────────────────────────────────────────────────────
const User = obj({ id: S.str, email: S.str, firstName: S.strN, lastName: S.strN, avatarUrl: S.strN, timezone: S.strN, emailVerifiedAt: S.dateN, onboardedAt: S.dateN, createdAt: S.date }, ['id', 'email']);
const Role = { type: 'string', enum: ['OWNER', 'ADMIN', 'MEMBER'] };
const Membership = obj({ id: S.str, organizationId: S.str, organizationName: S.str, role: Role }, ['id', 'organizationId', 'role']);
const Member = obj({ id: S.str, userId: S.str, email: S.str, firstName: S.strN, lastName: S.strN, role: Role, createdAt: S.date }, ['id', 'userId', 'email', 'role']);
const Invitation = obj({ id: S.str, email: S.str, role: Role, expiresAt: S.date, createdAt: S.date }, ['id', 'email', 'role']);
const Session = obj({ user: User, memberships: arr(Membership), currentOrganizationId: S.strN }, ['user', 'memberships']);
const ApiKey = obj({ id: S.str, name: S.str, prefix: S.str, lastUsedAt: S.dateN, createdAt: S.date }, ['id', 'name', 'prefix']);
const ApiKeyCreated = obj({ id: S.str, name: S.str, prefix: S.str, key: S.str, createdAt: S.date }, ['id', 'key']);
const EVENTS = ['post.published', 'comment.published', 'team.created', 'team.updated', 'team.deleted', 'social-account.created', 'social-account.updated', 'social-account.deleted', 'credit.low-balance', 'credit.exhausted', 'comment.received', 'conversation.created', 'conversation.updated', 'conversation.message.created', 'conversation.message.updated', 'conversation.read.updated'];
const Webhook = obj({ id: S.str, url: S.str, events: arr({ type: 'string', enum: EVENTS }), active: S.bool, secret: S.strN, createdAt: S.date, updatedAt: S.date }, ['id', 'url', 'events', 'active']);
const Delivery = obj({ id: S.str, event: S.str, eventId: S.str, attempt: S.int, status: { type: 'string', enum: ['PENDING', 'SUCCESS', 'FAILED'] }, responseCode: { type: 'integer', nullable: true }, responseBody: S.strN, durationMs: { type: 'integer', nullable: true }, nextAttemptAt: S.dateN, createdAt: S.date, payload: S.json }, ['id', 'event', 'status']);
const Notification = obj({ id: S.str, title: S.str, body: S.strN, link: S.strN, kind: S.str, readAt: S.dateN, createdAt: S.date }, ['id', 'title']);
const BioItem = obj({ id: S.str, bioId: S.str, type: { type: 'string', enum: ['LINK', 'HEADER', 'SOCIAL', 'TEXT'] }, title: S.str, url: S.strN, icon: S.strN, position: S.int, active: S.bool, clicks: S.int }, ['id', 'type', 'title']);
const Bio = obj({ id: S.str, teamId: S.str, slug: S.str, title: S.str, description: S.strN, avatarUrl: S.strN, theme: S.json, published: S.bool, items: arr(BioItem), createdAt: S.date, updatedAt: S.date }, ['id', 'slug', 'title']);
const Plan = { type: 'string', enum: ['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE'] };
const Subscription = obj({ plan: Plan, interval: { type: 'string', enum: ['MONTHLY', 'YEARLY'], nullable: true }, status: { type: 'string', enum: ['trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused'], nullable: true }, provider: { type: 'string', enum: ['STRIPE', 'CHIP', 'MOCK'], nullable: true }, currentPeriodEnd: S.dateN, trialEndsAt: S.dateN, cancelAtPeriodEnd: S.bool, currency: S.str }, ['plan']);
const Invoice = obj({ id: S.str, number: S.str, description: S.str, amountCents: S.int, currency: S.str, status: S.str, provider: S.str, pdfUrl: S.strN, hostedUrl: S.strN, periodStart: S.dateN, periodEnd: S.dateN, paidAt: S.dateN, paymentMethod: S.strN, createdAt: S.date }, ['id', 'number', 'amountCents']);
const InvoiceLine = obj({ description: S.str, quantity: S.int, unitAmountCents: S.int, amountCents: S.int, periodStart: S.dateN, periodEnd: S.dateN }, ['description', 'amountCents']);
const BillingDetails = obj({ name: S.strN, email: S.strN, address: S.strN, taxId: S.strN }, []);
const InvoiceDocument = { ...Invoice, properties: { ...Invoice.properties, lines: arr(InvoiceLine), subtotalCents: S.int, totalCents: S.int, amountPaidCents: S.int, amountDueCents: S.int, billTo: { ...BillingDetails, nullable: true }, issuer: S.json } };
const LedgerRow = obj({ id: S.str, deltaMicroUsd: S.int, reason: S.str, action: S.strN, refType: S.strN, refId: S.strN, createdAt: S.date }, ['id', 'deltaMicroUsd', 'reason']);
const Bot = obj({ id: S.str, teamId: S.str, name: S.str, avatarUrl: S.strN, createdAt: S.date }, ['id', 'name']);
const AuditRow = obj({ id: S.str, actorType: S.str, actorName: S.str, action: S.str, entity: S.str, entityId: S.strN, summary: S.str, createdAt: S.date }, ['id', 'summary']);
const PortalInfo = obj({ organizationName: S.str, brandName: S.strN, logoUrl: S.strN, accentColor: S.strN, teamName: S.str, allowedTypes: arr(S.str), connected: arr(obj({ type: S.str, username: S.strN, displayName: S.strN, avatarUrl: S.strN })), redirectUrl: S.strN, expiresAt: S.date }, ['organizationName', 'teamName', 'allowedTypes']);
const Checkout = obj({ url: S.str, provider: S.str }, ['url']);

export const extraPaths = {
  // ── auth (dashboard; cookie session) ──────────────────────────────────
  '/api/v1/auth/signup': { post: op('auth.signup', 'auth', 'Create an account', { body: obj({ email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 10 }, firstName: S.str, lastName: S.strN, organizationName: S.strN }, ['email', 'password', 'firstName']), res: Session, code: '201', security: PUBLIC }) },
  '/api/v1/auth/login': { post: op('auth.login', 'auth', 'Sign in', { body: obj({ email: S.str, password: S.str }, ['email', 'password']), res: Session, security: PUBLIC }) },
  '/api/v1/auth/logout': { post: op('auth.logout', 'auth', 'Sign out', { security: PUBLIC }) },
  '/api/v1/auth/me': { get: op('auth.me', 'auth', 'Current session', { res: Session }) },
  '/api/v1/auth/verify-email': { post: op('auth.verifyEmail', 'auth', 'Confirm an email address', { body: obj({ token: S.str }, ['token']), security: PUBLIC }) },
  '/api/v1/auth/resend-verification': { post: op('auth.resendVerification', 'auth', 'Send the verification email again') },
  '/api/v1/auth/forgot-password': { post: op('auth.forgotPassword', 'auth', 'Email a password reset link', { body: obj({ email: S.str }, ['email']), security: PUBLIC }) },
  '/api/v1/auth/reset-password': { post: op('auth.resetPassword', 'auth', 'Set a new password from a reset link', { body: obj({ token: S.str, password: { type: 'string', minLength: 10 } }, ['token', 'password']), security: PUBLIC }) },
  '/api/v1/auth/switch-organization': { post: op('auth.switchOrganization', 'auth', 'Switch the active organization', { body: obj({ organizationId: S.str }, ['organizationId']), res: Session }) },

  // ── user & members ────────────────────────────────────────────────────
  '/api/v1/user/me': {
    get: op('user.me', 'user', 'Get my profile', { res: User }),
    patch: op('user.updateMe', 'user', 'Update my profile', { body: obj({ firstName: S.str, lastName: S.strN, timezone: S.str, avatarUrl: S.strN }), res: User }),
  },
  '/api/v1/user/me/onboarding': { post: op('user.completeOnboarding', 'user', 'Finish the first-login welcome', { description: 'Marks the welcome as done (or skipped) and makes sure the organization has at least one team.', res: Session }) },
  '/api/v1/user/me/password': { post: op('user.changePassword', 'user', 'Change my password', { body: obj({ currentPassword: S.str, newPassword: { type: 'string', minLength: 10 } }, ['currentPassword', 'newPassword']) }) },
  '/api/v1/user/members': { get: op('user.members', 'user', 'List organization members', { params: page, res: list(Member) }) },
  '/api/v1/user/members/{id}': {
    patch: op('user.updateMember', 'user', 'Change a member role', { params: [idParam], body: obj({ role: Role }, ['role']), res: Member }),
    delete: op('user.removeMember', 'user', 'Remove a member', { params: [idParam] }),
  },
  '/api/v1/user/invitations': {
    get: op('user.invitations', 'user', 'List pending invitations', { res: list(Invitation) }),
    post: op('user.invite', 'user', 'Invite someone to the organization', { body: obj({ email: { type: 'string', format: 'email' }, role: Role }, ['email', 'role']), res: Invitation, code: '201' }),
  },
  '/api/v1/user/invitations/{id}': { delete: op('user.revokeInvitation', 'user', 'Revoke an invitation', { params: [idParam] }) },
  '/api/v1/user/invitations/accept': { post: op('user.acceptInvitation', 'user', 'Accept an invitation', { body: obj({ token: S.str, password: S.strN, firstName: S.strN }, ['token']), res: Session, security: PUBLIC }) },

  // ── organization (dashboard additions) ─────────────────────────────────
  '/api/v1/organization/create': { post: op('organization.create', 'organization', 'Create another organization', { body: obj({ name: S.str }, ['name']), res: Membership, code: '201' }) },
  '/api/v1/organization/settings': {
    patch: op('organization.updateSettings', 'organization', 'Update organization settings', {
      body: obj({ name: S.str, uploadsCompression: S.bool, verboseErrors: S.bool, remoteDisconnectChecks: S.bool, deleteDisconnectedAfterHours: { type: 'integer', minimum: 0, maximum: 168 }, portalBrandName: S.strN, portalLogoUrl: S.strN, portalAccentColor: S.strN }),
      res: S.json,
    }),
  },
  '/api/v1/organization/delete': { post: op('organization.delete', 'organization', 'Delete the organization', { body: obj({ confirmName: S.str }, ['confirmName']) }) },
  '/api/v1/organization/audit-log': { get: op('organization.auditLog', 'organization', 'Organization activity log', { params: page, res: list(AuditRow) }) },

  // ── API keys ───────────────────────────────────────────────────────────
  '/api/v1/api-key': {
    get: op('apiKey.list', 'api-key', 'List API keys', { params: [...page, q('q')], res: list(ApiKey) }),
    post: op('apiKey.create', 'api-key', 'Create an API key (the key is shown once)', { body: obj({ name: S.str }, ['name']), res: ApiKeyCreated, code: '201' }),
  },
  '/api/v1/api-key/{id}': { delete: op('apiKey.delete', 'api-key', 'Delete an API key', { params: [idParam] }) },
  '/api/v1/api-key/{id}/roll': { post: op('apiKey.roll', 'api-key', 'Replace an API key with a new secret', { params: [idParam], res: ApiKeyCreated }) },

  // ── webhooks ───────────────────────────────────────────────────────────
  '/api/v1/webhook': {
    get: op('webhook.list', 'webhook', 'List webhooks', { params: page, res: list(Webhook) }),
    post: op('webhook.create', 'webhook', 'Create a webhook', { body: obj({ url: { type: 'string', format: 'uri' }, events: arr({ type: 'string', enum: EVENTS }), active: S.bool }, ['url', 'events']), res: Webhook, code: '201' }),
  },
  '/api/v1/webhook/{id}': {
    get: op('webhook.get', 'webhook', 'Get a webhook', { params: [idParam], res: Webhook }),
    patch: op('webhook.update', 'webhook', 'Update a webhook', { params: [idParam], body: obj({ url: { type: 'string', format: 'uri' }, events: arr({ type: 'string', enum: EVENTS }), active: S.bool }), res: Webhook }),
    delete: op('webhook.delete', 'webhook', 'Delete a webhook', { params: [idParam] }),
  },
  '/api/v1/webhook/{id}/rotate-secret': { post: op('webhook.rotateSecret', 'webhook', 'Rotate the signing secret', { params: [idParam], res: Webhook }) },
  '/api/v1/webhook/{id}/test': { post: op('webhook.test', 'webhook', 'Send a test event', { params: [idParam], res: Delivery }) },
  '/api/v1/webhook/{id}/deliveries': { get: op('webhook.deliveries', 'webhook', 'List deliveries', { params: [idParam, ...page, q('status')], res: list(Delivery) }) },
  '/api/v1/webhook/{id}/deliveries/{deliveryId}/resend': { post: op('webhook.resend', 'webhook', 'Resend a delivery', { params: [idParam, { name: 'deliveryId', in: 'path', required: true, schema: S.str }], res: Delivery }) },

  // ── notifications ──────────────────────────────────────────────────────
  '/api/v1/notification': { get: op('notification.list', 'notification', 'List my notifications', { params: [...page, q('q'), q('unread', S.bool)], res: obj({ items: arr(Notification), total: S.int, unread: S.int }, ['items', 'total']) }) },
  '/api/v1/notification/{id}/read': { post: op('notification.read', 'notification', 'Mark a notification read', { params: [idParam] }) },
  '/api/v1/notification/read-all': { post: op('notification.readAll', 'notification', 'Mark every notification read') },

  // ── team bots (Discord/Slack posting identities) ────────────────────────
  '/api/v1/bot': {
    get: op('bot.list', 'bot', 'List bots of a team', { params: [q('teamId', S.str, true)], res: list(Bot) }),
    post: op('bot.create', 'bot', 'Create a bot identity', { body: obj({ teamId: S.str, name: S.str, avatarUrl: S.strN }, ['teamId', 'name']), res: Bot, code: '201' }),
  },
  '/api/v1/bot/{id}': {
    patch: op('bot.update', 'bot', 'Update a bot identity', { params: [idParam], body: obj({ name: S.str, avatarUrl: S.strN }), res: Bot }),
    delete: op('bot.delete', 'bot', 'Delete a bot identity', { params: [idParam] }),
  },

  // ── link in bio ────────────────────────────────────────────────────────
  '/api/v1/bio': {
    get: op('bio.list', 'bio', 'List bio pages', { params: [q('teamId'), ...page], res: list(Bio) }),
    post: op('bio.create', 'bio', 'Create a bio page', { body: obj({ teamId: S.str, slug: S.str, title: S.str, description: S.strN, avatarUrl: S.strN, theme: S.json }, ['teamId', 'slug', 'title']), res: Bio, code: '201' }),
  },
  '/api/v1/bio/{id}': {
    get: op('bio.get', 'bio', 'Get a bio page', { params: [idParam], res: Bio }),
    patch: op('bio.update', 'bio', 'Update a bio page', { params: [idParam], body: obj({ slug: S.str, title: S.str, description: S.strN, avatarUrl: S.strN, theme: S.json, published: S.bool }), res: Bio }),
    delete: op('bio.delete', 'bio', 'Delete a bio page', { params: [idParam] }),
  },
  '/api/v1/bio-item': { post: op('bioItem.create', 'bio-item', 'Add an item to a bio page', { body: obj({ bioId: S.str, type: { type: 'string', enum: ['LINK', 'HEADER', 'SOCIAL', 'TEXT'] }, title: S.str, url: S.strN, icon: S.strN }, ['bioId', 'type', 'title']), res: BioItem, code: '201' }) },
  '/api/v1/bio-item/{id}': {
    patch: op('bioItem.update', 'bio-item', 'Update a bio item', { params: [idParam], body: obj({ title: S.str, url: S.strN, icon: S.strN, active: S.bool }), res: BioItem }),
    delete: op('bioItem.delete', 'bio-item', 'Delete a bio item', { params: [idParam] }),
  },
  '/api/v1/bio-item/reorder': { post: op('bioItem.reorder', 'bio-item', 'Reorder bio items', { body: obj({ bioId: S.str, ids: arr(S.str) }, ['bioId', 'ids']) }) },
  '/api/v1/bio-analytics': { get: op('bioAnalytics.get', 'bio-analytics', 'Views and clicks of a bio page', { params: [q('bioId', S.str, true), q('from'), q('to')], res: obj({ views: S.int, clicks: S.int, days: arr(obj({ day: S.str, views: S.int, clicks: S.int })), items: arr(obj({ itemId: S.str, title: S.str, clicks: S.int })) }) }) },

  // ── billing ────────────────────────────────────────────────────────────
  '/api/v1/billing/subscription': { get: op('billing.subscription', 'billing', 'Current plan and subscription', { res: Subscription }) },
  '/api/v1/billing/checkout': { post: op('billing.checkout', 'billing', 'Start a plan checkout', { body: obj({ plan: Plan, interval: { type: 'string', enum: ['MONTHLY', 'YEARLY'] }, provider: { type: 'string', enum: ['STRIPE', 'CHIP'] }, coupon: S.strN }, ['plan', 'interval']), res: Checkout }) },
  '/api/v1/billing/portal': { post: op('billing.portal', 'billing', 'Open the payment-details portal', { res: Checkout }) },
  '/api/v1/billing/cancel': { post: op('billing.cancel', 'billing', 'Cancel at the end of the period', { res: Subscription }) },
  '/api/v1/billing/resume': { post: op('billing.resume', 'billing', 'Undo a pending cancellation', { res: Subscription }) },
  '/api/v1/billing/invoices': { get: op('billing.invoices', 'billing', 'List invoices', { params: page, res: list(Invoice) }) },
  '/api/v1/billing/invoices/{id}': { get: op('billing.invoice', 'billing', 'Get an invoice with its lines', { params: [idParam], res: InvoiceDocument }) },
  '/api/v1/billing/details': {
    get: op('billing.details', 'billing', 'Billing details printed on invoices', { res: BillingDetails }),
    patch: op('billing.updateDetails', 'billing', 'Update billing details', { body: obj({ name: { type: 'string', maxLength: 200, nullable: true }, email: { type: 'string', format: 'email', maxLength: 254, nullable: true }, address: { type: 'string', maxLength: 600, nullable: true }, taxId: { type: 'string', maxLength: 60, nullable: true } }), res: BillingDetails }),
  },
  '/api/v1/billing/credits/top-up': { post: op('billing.topUp', 'billing', 'Buy X credit', { body: obj({ amountUsd: { type: 'integer', minimum: 5, maximum: 5000 }, provider: { type: 'string', enum: ['STRIPE', 'CHIP'] } }, ['amountUsd']), res: Checkout }) },
  '/api/v1/billing/credits/ledger': { get: op('billing.ledger', 'billing', 'Credit movements', { params: page, res: list(LedgerRow) }) },
  '/api/v1/billing/credits/settings': { patch: op('billing.creditSettings', 'billing', 'Set the low-balance threshold', { body: obj({ lowBalanceThresholdMicroUsd: S.int }, ['lowBalanceThresholdMicroUsd']), res: S.json }) },

  // ── hosted connect portal (public, token in path) ─────────────────────
  '/api/v1/portal/{token}': { get: op('portal.info', 'portal', 'Portal page data', { params: [{ name: 'token', in: 'path', required: true, schema: S.str }], res: PortalInfo, security: PUBLIC }) },
  '/api/v1/portal/{token}/connect': { post: op('portal.connect', 'portal', 'Start connecting a network from the portal', { params: [{ name: 'token', in: 'path', required: true, schema: S.str }], body: obj({ type: S.str, serverUrl: S.strN }, ['type']), res: obj({ url: S.str }, ['url']), security: PUBLIC }) },
  '/api/v1/portal/{token}/disconnect': { post: op('portal.disconnect', 'portal', 'Disconnect a network from the portal', { params: [{ name: 'token', in: 'path', required: true, schema: S.str }], body: obj({ type: S.str }, ['type']), security: PUBLIC }) },
};
