import type { FastifyInstance } from 'fastify';

// Handlers for this area are registered here with define({...}); jobs with registerJob(...).

/** Raw (non-OpenAPI) routes owned by this module, if any. */
export async function contentRawRoutes(_app: FastifyInstance) {}
