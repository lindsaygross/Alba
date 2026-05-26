/**
 * Alba AI Proxy — Cloudflare Worker
 *
 * Purpose: hold the GitHub Models token SERVER-SIDE so it never ships inside the
 * browser extension. The extension POSTs a constrained request here; this worker
 * attaches the secret and forwards to GitHub Models.
 *
 * The token lives ONLY in a Cloudflare secret (env.GITHUB_MODELS_TOKEN). It is
 * never hardcoded, logged, or returned to the client.
 *
 * Set the secret before deploying:
 *   wrangler secret put GITHUB_MODELS_TOKEN
 *
 * SECURITY NOTE: this endpoint is PUBLIC (no per-user auth). The mode allow-list,
 * server-side system prompts, input cap, and per-IP rate limit are DETERRENTS to
 * keep it from being used as a general free LLM proxy — they are not a substitute
 * for real authentication. The system prompts below force the endpoint to only do
 * Alba's two tasks (prompt optimization + the "wrapped" eco recap).
 */

const GITHUB_MODELS_URL = 'https://models.inference.ai.azure.com/chat/completions';
const MODEL_ID = 'gpt-4o-mini';

// Abuse deterrents.
const MAX_PROMPT_CHARS = 8000; // reject anything larger than a sane prompt
const RATE_LIMIT_MAX = 20; // requests per IP per window
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

// System prompts live here (moved out of the shipped extension) so the public
// endpoint can ONLY perform these two constrained tasks.
const OPTIMIZER_SYSTEM = `You are an expert prompt engineer. You compress prompts to use minimum tokens. Keep EXACT same meaning but remove ALL unnecessary words.

RULES:
1. Strip politeness: please, kindly, could you, would you, can you → DELETE
2. Strip filler: really, very, just, actually, basically → DELETE
3. Simplify actions: "help me write" → "write", "I want to" → "", "I need" → ""
4. Direct commands only: "Explain how X works" → "Explain X"
5. No meta-requests: "write a prompt that" → just the actual request

EXAMPLES:
Input: "Please help me write a Python function"
Output: "Python function"

Input: "Could you kindly explain machine learning to me?"
Output: "Explain machine learning"

Input: "I want to learn how to code in JavaScript"
Output: "Learn JavaScript"

CRITICAL: Output ONLY the compressed version. Nothing else.`;

const WRAPPED_SYSTEM = `You are Alba's climate storyteller. Given daily energy (Wh), carbon (gCO2), and water (mL) totals from AI usage plus estimated savings, craft a recap that celebrates resources avoided. Respond ONLY with JSON matching this schema:
{
  "headline": string,
  "subhead": string,
  "cards": [
    {
      "title": string,
      "statLabel": string,
      "statValue": string,
      "analogy": string,
      "tip": string
    }
  ],
  "cta": string,
  "footnote": string
}

Guidelines:
- Tone: upbeat, funky, funny, climate-savvy, confident, 1-2 sentences per field.
- Analogy: mix home energy, public transit, hydration, nature, and household objects.
- Use the provided savings.* values for statValue + analogy; mention totals.* only for context.
- Keep numbers realistic. Convert units when it improves clarity.
- Limit cards to 3 entries.`;

// Per-mode request shaping (kept identical to the extension's previous behavior).
const MODES = {
  optimize: {
    system: OPTIMIZER_SYSTEM,
    temperature: 0.25,
    maxTokens: 200,
    buildUserMessage: (body) => `Original prompt: ${body.prompt}`
  },
  wrapped: {
    system: WRAPPED_SYSTEM,
    temperature: 0.9,
    maxTokens: 600,
    buildUserMessage: (body) => `Create the recap for: ${JSON.stringify(body.payload || {})}`
  }
};

// Best-effort, per-isolate sliding-window rate limiter. Worker isolates are
// ephemeral and per-edge-location, so this is a deterrent only — not global
// accounting. Use Durable Objects / KV if you need hard limits.
const ipHits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

export default {
  async fetch(request, env) {
    // CORS preflight (the extension sends Content-Type: application/json).
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed. Use POST.' }, 405);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(ip)) {
      return jsonResponse({ error: 'Rate limit exceeded. Try again shortly.' }, 429);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body.' }, 400);
    }

    const modeConfig = MODES[body?.mode];
    if (!modeConfig) {
      return jsonResponse({ error: 'Invalid mode. Expected "optimize" or "wrapped".' }, 400);
    }

    // Validate / cap input size per mode.
    if (body.mode === 'optimize') {
      if (typeof body.prompt !== 'string' || !body.prompt.trim()) {
        return jsonResponse({ error: 'Missing prompt.' }, 400);
      }
      if (body.prompt.length > MAX_PROMPT_CHARS) {
        return jsonResponse({ error: `Prompt too large (max ${MAX_PROMPT_CHARS} chars).` }, 413);
      }
    } else {
      // wrapped
      const serialized = JSON.stringify(body.payload || {});
      if (serialized.length > MAX_PROMPT_CHARS) {
        return jsonResponse({ error: `Payload too large (max ${MAX_PROMPT_CHARS} chars).` }, 413);
      }
    }

    // The token is read ONLY from the server-side secret. Never hardcode it.
    const token = env.GITHUB_MODELS_TOKEN;
    if (!token) {
      return jsonResponse(
        { error: 'Proxy misconfigured: GITHUB_MODELS_TOKEN secret is not set.' },
        500
      );
    }

    try {
      const upstream = await fetch(GITHUB_MODELS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
            { role: 'system', content: modeConfig.system },
            { role: 'user', content: modeConfig.buildUserMessage(body) }
          ],
          temperature: modeConfig.temperature,
          max_tokens: modeConfig.maxTokens
        })
      });

      if (!upstream.ok) {
        // Surface the status but not the token; upstream error text is safe to relay.
        const detail = await upstream.text().catch(() => '');
        return jsonResponse(
          { error: 'Upstream model error.', status: upstream.status, detail: detail.slice(0, 500) },
          502
        );
      }

      const data = await upstream.json();
      // Raw content so the client can parse JSON for the "wrapped" mode.
      const text = data?.choices?.[0]?.message?.content?.trim() || '';
      return jsonResponse({ text });
    } catch (err) {
      return jsonResponse({ error: 'Proxy request failed.', detail: String(err).slice(0, 300) }, 502);
    }
  }
};
