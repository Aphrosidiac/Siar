import type { FastifyInstance } from 'fastify';
import './content-comments.js';
import './content-analytics.js';
import './content-history.js';
import './content-csv.js';
import './content-misc.js';
import { templateCsv } from './content-csv.js';

// Handlers for this area are registered here with define({...}); jobs with registerJob(...).

/** Raw (non-OpenAPI) routes owned by this module, if any. */
export async function contentRawRoutes(app: FastifyInstance) {
  // Static path wins over /post-csv-import/:importId in the router.
  app.get('/api/v1/post-csv-import/template.csv', async (_req, reply) =>
    reply.header('content-type', 'text/csv; charset=utf-8').header('content-disposition', 'attachment; filename="siar-bulk-post-template.csv"').send(templateCsv()));
}
