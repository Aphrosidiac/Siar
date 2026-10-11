import type { FastifyInstance } from 'fastify';
// Each module registers its operation handlers (define) and jobs (registerJob) on import.
import './identity.js';
import './teams.js';
import './accounts.js';
import './uploads.js';
import './posts.js';
import './system.js';
import './content.js';
import './billing.js';
import './bio.js';
import './messaging.js';
import { accountRawRoutes } from './accounts.js';
import { uploadRawRoutes } from './uploads.js';
import { contentRawRoutes } from './content.js';
import { billingRawRoutes } from './billing.js';
import { bioRawRoutes } from './bio.js';
import { messagingRawRoutes } from './messaging.js';

/** Imported for its side effects; kept as a function so app.ts reads as a sequence. */
export function registerModules() {}

/** Routes that are not part of the OpenAPI contract: OAuth callbacks, media, provider webhooks. */
export async function registerRawRoutes(app: FastifyInstance) {
  await accountRawRoutes(app);
  await uploadRawRoutes(app);
  await contentRawRoutes(app);
  await billingRawRoutes(app);
  await bioRawRoutes(app);
  await messagingRawRoutes(app);
}
