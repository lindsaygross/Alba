# Alba AI Proxy (Cloudflare Worker)

Holds the GitHub Models token **server-side** so it never ships inside the extension.
The extension POSTs constrained requests here; the worker attaches the secret and
forwards to GitHub Models (`gpt-4o-mini`).

## Endpoint

`POST /` with JSON:

```jsonc
// optimize a prompt
{ "mode": "optimize", "prompt": "Please could you help me write a function" }

// generate the "wrapped" eco recap
{ "mode": "wrapped", "payload": { "dateLabel": "...", "totals": {...}, "savings": {...} } }
```

Response: `{ "text": "<model output>" }`. For `wrapped`, `text` is the raw model
content (may be fenced JSON); the extension parses it client-side.

The system prompts live in `worker.js`, so this endpoint can only do these two
tasks — it is **not** a general LLM proxy. It is public; the mode allow-list,
8k-char input cap, and per-IP rate limit are deterrents, not authentication.

## Deploy

```bash
cd proxy
npm install -g wrangler        # or: npx wrangler ...
wrangler login                 # opens a browser; needs your Cloudflare account
wrangler secret put GITHUB_MODELS_TOKEN   # paste the GitHub Models token when prompted
wrangler deploy                # prints the deployed https://...workers.dev URL
```

Then paste that URL into the extension:
- `manifest.json` → `host_permissions`
- `aiClient.js` → `PROXY_URL`

## Local testing

```bash
cd proxy
wrangler dev                   # http://127.0.0.1:8787
```

Point `aiClient.js` `PROXY_URL` at `http://127.0.0.1:8787` while testing (see the
commented `LOCAL` line there). `wrangler dev` reads the secret from your
`wrangler secret` store or a local `.dev.vars` file (`GITHUB_MODELS_TOKEN=...`,
which is gitignored — never commit it).
