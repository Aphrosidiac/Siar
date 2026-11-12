/**
 * Request examples for the guides. Paths and headers follow packages/contract/openapi.json exactly:
 * POST /api/v1/post/ with the x-api-key header. Every block that uses these is labelled "Example".
 */
import { API_BASE } from '../../config';

export const POST_URL = `${API_BASE}/post/`;
const json = (o: unknown) => JSON.stringify(o, null, 2);

export const curlCreate = (body: unknown) =>
  `curl -X POST "${POST_URL}" \\
  -H "x-api-key: $SIAR_API_KEY" \\
  -H "content-type: application/json" \\
  -d '${json(body).replace(/\n/g, '\n  ')}'`;

export const nodeCreate = (body: unknown) =>
  `const res = await fetch('${POST_URL}', {
  method: 'POST',
  headers: { 'x-api-key': process.env.SIAR_API_KEY, 'content-type': 'application/json' },
  body: JSON.stringify(${json(body).replace(/\n/g, '\n  ')}),
});
const post = await res.json();
if (!res.ok) throw new Error(post.message);
console.log(post.id, post.status);`;

export const pythonCreate = (body: unknown) =>
  `import os, requests

res = requests.post(
    "${POST_URL}",
    headers={"x-api-key": os.environ["SIAR_API_KEY"]},
    json=${json(body).replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None').replace(/\n/g, '\n    ')},
)
post = res.json()
res.raise_for_status()
print(post["id"], post["status"])`;

export const createTabs = (body: unknown) => [
  { label: 'curl', lang: 'bash', code: curlCreate(body) },
  { label: 'Node.js', lang: 'js', code: nodeCreate(body) },
  { label: 'Python', lang: 'python', code: pythonCreate(body) },
];

export const pretty = json;
