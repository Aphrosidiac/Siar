import { NetworkError } from './errors.js';
import type { NetworkAdapter, NetworkType } from '../types.js';

/** Placeholder until the adapter is written: connects and publishes nothing, says so clearly. */
export function stubAdapter(type: NetworkType, displayName: string): NetworkAdapter {
  const no = async (): Promise<never> => { throw new NetworkError('NOT_SUPPORTED', `${displayName} is not available yet.`); };
  return {
    type, displayName, credentialKeys: [], scopes: [],
    capabilities: { connect: 'oauth2', channels: 'none', postTypes: [], comments: false, firstComment: false, editPost: false, deletePost: false, editComment: false, deleteComment: false, commentImport: false, commentActions: [], accountAnalytics: false, postAnalytics: false, historyImport: false, messaging: false, metered: false },
    limits: { textMax: null, commentMax: null, media: { maxItems: 0 } },
    authorize: no, exchange: no, refreshProfile: no, checkConnection: async () => true, publish: no,
    validate: () => [],
  };
}
