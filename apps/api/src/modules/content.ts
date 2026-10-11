import type { FastifyInstance } from 'fastify';
import './content-comments.js';
import './content-analytics.js';
import './content-history.js';
import './content-csv.js';
import './content-misc.js';

// Handlers for this area are registered here with define({...}); jobs with registerJob(...).

/** Raw (non-OpenAPI) routes owned by this module, if any. */
export async function contentRawRoutes(_app: FastifyInstance) {}
