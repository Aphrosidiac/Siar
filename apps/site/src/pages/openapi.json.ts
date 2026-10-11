import { SPEC } from '../lib/openapi';
export const GET = () => new Response(JSON.stringify(SPEC), { headers: { 'content-type': 'application/json; charset=utf-8' } });
