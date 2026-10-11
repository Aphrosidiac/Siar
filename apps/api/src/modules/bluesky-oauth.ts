import type { FastifyInstance } from 'fastify';
import type { NetworkAdapter, NetworkContext } from '@siar/networks';
import { adapter, networkContext } from '../platform/networks.js';

type WithClientMetadata = NetworkAdapter & { clientMetadata(ctx: Pick<NetworkContext, 'apiUrl' | 'redirectUri'>): Record<string, unknown> };

/**
 * Raw route (outside the OpenAPI document, like the other OAuth plumbing): the atproto OAuth client
 * metadata document. Bluesky's authorization servers fetch it from our client_id URL
 * (<API_URL>/api/v1/oauth/bluesky/client-metadata.json) to learn our redirect URI, scope and DPoP use.
 * The document itself is built by the Bluesky adapter so client_id and the adapter never disagree.
 */
export async function blueskyRawRoutes(app: FastifyInstance) {
  app.get('/api/v1/oauth/bluesky/client-metadata.json', async (_req, reply) => {
    const ad = adapter('BLUESKY') as WithClientMetadata;
    return reply.header('cache-control', 'public, max-age=300').type('application/json').send(ad.clientMetadata(networkContext('BLUESKY')));
  });
}
