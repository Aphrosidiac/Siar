import { API_BASE } from '../config';

export const POST_BODY = {
  teamId: 'TEAM_ID',
  title: 'Launch day',
  postDate: '2026-11-02T09:00:00.000Z',
  status: 'SCHEDULED',
  socialAccountTypes: ['INSTAGRAM', 'LINKEDIN', 'BLUESKY'],
  data: {
    INSTAGRAM: { type: 'POST', text: 'We shipped. Details in the comments.', uploadIds: ['UPLOAD_ID'] },
    LINKEDIN: { text: 'We shipped today. Here is what changed and why.', uploadIds: ['UPLOAD_ID'] },
    BLUESKY: { text: 'We shipped today.', uploadIds: ['UPLOAD_ID'] },
  },
  firstComment: { INSTAGRAM: 'Changelog: example.com/changelog' },
};

const json = (o: unknown) => JSON.stringify(o, null, 2);

export const createPostCurl = (body: unknown = POST_BODY) =>
  `curl -X POST "${API_BASE}/post" \\
  -H "x-api-key: $SIAR_API_KEY" \\
  -H "content-type: application/json" \\
  -d '${json(body).replace(/\n/g, '\n  ')}'`;

export const createPostNode = (body: unknown = POST_BODY) =>
  `const res = await fetch('${API_BASE}/post', {
  method: 'POST',
  headers: { 'x-api-key': process.env.SIAR_API_KEY, 'content-type': 'application/json' },
  body: JSON.stringify(${json(body).replace(/\n/g, '\n  ')}),
});
const post = await res.json();
console.log(post.id, post.status); // e.g. "SCHEDULED"`;

export const createPostPython = (body: unknown = POST_BODY) =>
  `import os, requests

res = requests.post(
    "${API_BASE}/post",
    headers={"x-api-key": os.environ["SIAR_API_KEY"]},
    json=${json(body).replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None').replace(/\n/g, '\n    ')},
)
post = res.json()
print(post["id"], post["status"])`;

export const postTabs = (body: unknown = POST_BODY) => [
  { label: 'curl', lang: 'bash', code: createPostCurl(body) },
  { label: 'Node.js', lang: 'js', code: createPostNode(body) },
  { label: 'Python', lang: 'python', code: createPostPython(body) },
];

export const verifyNode = `import { createHmac, timingSafeEqual } from 'node:crypto';

// Use the raw request body exactly as received, before any JSON parsing.
export function verifySiarWebhook(rawBody, headers, secret, toleranceSeconds = 300) {
  const timestamp = headers['x-siar-timestamp'];
  const signature = headers['x-siar-signature'];
  if (!timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > toleranceSeconds) return false;
  const expected = createHmac('sha256', secret).update(\`\${timestamp}.\${rawBody}\`).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(String(signature), 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

// Express example: keep the raw body for this route.
app.post('/webhooks/siar', express.raw({ type: 'application/json' }), (req, res) => {
  const raw = req.body.toString('utf8');
  if (!verifySiarWebhook(raw, req.headers, process.env.SIAR_WEBHOOK_SECRET)) return res.sendStatus(401);
  const event = JSON.parse(raw);
  // Deduplicate on the x-siar-delivery header or event.id, then handle event.type.
  res.sendStatus(200);
});`;

export const verifyPython = `import hashlib, hmac, time

def verify_siar_webhook(raw_body: bytes, headers, secret: str, tolerance: int = 300) -> bool:
    timestamp = headers.get("x-siar-timestamp")
    signature = headers.get("x-siar-signature")
    if not timestamp or not signature:
        return False
    if abs(time.time() - int(timestamp)) > tolerance:
        return False
    message = timestamp.encode() + b"." + raw_body
    expected = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

# Flask example
@app.post("/webhooks/siar")
def siar_webhook():
    raw = request.get_data()  # raw bytes, before JSON parsing
    if not verify_siar_webhook(raw, request.headers, os.environ["SIAR_WEBHOOK_SECRET"]):
        abort(401)
    event = request.get_json()
    return "", 200`;

export const connectCurl = `curl -X POST "${API_BASE}/social-account/connect" \\
  -H "x-api-key: $SIAR_API_KEY" \\
  -H "content-type: application/json" \\
  -d '{
    "type": "LINKEDIN",
    "teamId": "TEAM_ID",
    "redirectUrl": "https://yourapp.example/connected"
  }'
# → { "url": "https://www.linkedin.com/oauth/v2/authorization?..." }
# Send your user to that URL. After consent they land back on redirectUrl.`;

export const portalCurl = `curl -X POST "${API_BASE}/social-account/create-portal-link" \\
  -H "x-api-key: $SIAR_API_KEY" \\
  -H "content-type: application/json" \\
  -d '{
    "teamId": "TEAM_ID",
    "socialAccountTypes": ["INSTAGRAM", "TIKTOK", "YOUTUBE", "LINKEDIN"],
    "redirectUrl": "https://yourapp.example/settings/social",
    "logoUrl": "https://yourapp.example/logo.png",
    "userName": "Acme Bakery",
    "hidePoweredBy": true,
    "language": "en"
  }'
# → { "url": "https://app.<domain>/connect/..." }  — a hosted page your user opens`;

export const uploadCurl = `# Small files: multipart form upload
curl -X POST "${API_BASE}/upload" \\
  -H "x-api-key: $SIAR_API_KEY" \\
  -F "teamId=TEAM_ID" \\
  -F "file=@./launch.jpg"

# Or let Siar fetch it from a public URL
curl -X POST "${API_BASE}/upload/from-url" \\
  -H "x-api-key: $SIAR_API_KEY" \\
  -H "content-type: application/json" \\
  -d '{ "teamId": "TEAM_ID", "url": "https://cdn.example.com/launch.mp4" }'
# → { "id": "UPLOAD_ID", "type": "video", "mime": "video/mp4", ... }`;

export const webhookCreateCurl = `curl -X POST "${API_BASE}/webhook" \\
  -H "x-api-key: $SIAR_API_KEY" \\
  -H "content-type: application/json" \\
  -d '{
    "url": "https://yourapp.example/webhooks/siar",
    "events": ["post.published", "comment.received", "social-account.updated"]
  }'
# → { "id": "...", "secret": "..." }  — store the secret; it signs every delivery`;

export const teamCurl = `curl -X POST "${API_BASE}/team" \\
  -H "x-api-key: $SIAR_API_KEY" \\
  -H "content-type: application/json" \\
  -d '{ "name": "Acme Bakery" }'
# → { "id": "TEAM_ID", "name": "Acme Bakery", ... }`;

export const analyticsCurl = `curl "${API_BASE}/analytics/post?postId=POST_ID&platformType=INSTAGRAM" \\
  -H "x-api-key: $SIAR_API_KEY"`;

export const commentCurl = `curl -X POST "${API_BASE}/comment" \\
  -H "x-api-key: $SIAR_API_KEY" \\
  -H "content-type: application/json" \\
  -d '{
    "teamId": "TEAM_ID",
    "internalPostId": "POST_ID",
    "socialAccountTypes": ["INSTAGRAM", "LINKEDIN"],
    "data": {
      "INSTAGRAM": { "text": "Thanks for all the questions. Answers below." },
      "LINKEDIN": { "text": "Thanks for all the questions. Answers below." }
    }
  }'`;

export const importCurl = `curl -X POST "${API_BASE}/post-history-import" \\
  -H "x-api-key: $SIAR_API_KEY" \\
  -H "content-type: application/json" \\
  -d '{ "teamId": "TEAM_ID", "socialAccountType": "INSTAGRAM", "count": 50, "withAnalytics": true }'
# → { "id": "IMPORT_ID", "status": "PENDING", ... }  then poll GET /post-history-import/IMPORT_ID`;

export const csvCurl = `curl -X POST "${API_BASE}/post-csv-import" \\
  -H "x-api-key: $SIAR_API_KEY" \\
  -F "file=@./november-posts.csv"
# → { "id": "IMPORT_ID", "status": "PENDING", "totalRows": 120, ... }
curl "${API_BASE}/post-csv-import/IMPORT_ID/rows" -H "x-api-key: $SIAR_API_KEY"`;

export const mcpConfig = `{
  "mcpServers": {
    "siar": {
      "command": "npx",
      "args": ["-y", "@siar/mcp"],
      "env": { "SIAR_API_KEY": "your-api-key" }
    }
  }
}`;

export const cliSample = `npm install -g @siar/cli
export SIAR_API_KEY=your-api-key

siar --help              # every command, grouped like the API
siar team list           # JSON out, ready for jq
siar post create --file post.json`;

export const sdkSample = `npm install @siar/sdk

import { Siar } from '@siar/sdk';

const siar = new Siar({ apiKey: process.env.SIAR_API_KEY });
const post = await siar.post.create({ ...body });`;
