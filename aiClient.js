/**
 * Alba AI Client - Server-Proxied GitHub Models Integration
 *
 * The GitHub Models token is NOT in the extension. All AI calls go to a
 * server-side proxy (a Cloudflare Worker — see proxy/) that holds the token as
 * a server secret and forwards to GitHub Models. No secret ships to users.
 *
 * The system prompts and model selection also live in the worker, so this file
 * only knows how to ask for two constrained tasks: "optimize" and "wrapped".
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURE ME — deployed proxy URL (see proxy/README.md to deploy the worker).
// Replace the placeholder below with your real worker URL, e.g.
//   https://alba-ai-proxy.<your-subdomain>.workers.dev
// ─────────────────────────────────────────────────────────────────────────────
const PROXY_URL = 'https://YOUR-PROXY.example.workers.dev';
// LOCAL TESTING: comment out the line above and use this against `wrangler dev`:
// const PROXY_URL = 'http://127.0.0.1:8787';

// If PROXY_URL still contains this marker, the proxy is treated as unconfigured
// and the extension silently falls back to local-only behavior.
const PROXY_PLACEHOLDER = 'YOUR-PROXY.example';

// Simple client-side rate limiter: max calls per minute (avoids hammering the
// proxy; the worker also rate-limits independently).
const RATE_LIMIT = { maxPerMinute: 10, calls: [], blocked: false };

function checkRateLimit() {
  const now = Date.now();
  RATE_LIMIT.calls = RATE_LIMIT.calls.filter(t => now - t < 60000);
  if (RATE_LIMIT.calls.length >= RATE_LIMIT.maxPerMinute) {
    return false;
  }
  RATE_LIMIT.calls.push(now);
  return true;
}

/**
 * Check if the AI client is configured (PROXY_URL points at a real proxy).
 */
function isConfigured() {
  return (
    typeof PROXY_URL === 'string' &&
    /^https?:\/\//.test(PROXY_URL) &&
    !PROXY_URL.includes(PROXY_PLACEHOLDER)
  );
}

/**
 * POST a constrained request to the proxy. Returns the completion text, or null
 * on any failure (so callers can degrade gracefully). Never throws.
 */
async function callProxy(mode, fields) {
  if (!isConfigured()) {
    console.warn('[Alba] Proxy URL not configured; skipping AI call');
    return null;
  }

  if (!checkRateLimit()) {
    console.warn('[Alba] Rate limit exceeded, skipping proxy call');
    return null;
  }

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, ...fields })
    });

    if (!response.ok) {
      console.error('[Alba] Proxy error:', response.status);
      return null;
    }

    const data = await response.json();
    const text = data?.text;
    return typeof text === 'string' && text.trim() ? text.trim() : null;
  } catch (err) {
    console.error('[Alba] Proxy request failed:', err);
    return null;
  }
}

/**
 * Optimize a prompt via the proxy. Returns the optimized text, or null on
 * failure (content.js then falls back to its local optimizer).
 */
async function optimizePrompt(prompt) {
  if (!prompt?.trim()) return null;
  return callProxy('optimize', { prompt });
}

/**
 * Extract JSON from AI response (handles markdown code blocks)
 */
function extractJson(text) {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/```(?:json)?([\s\S]*?)```/i);
  const payload = match ? match[1] : trimmed;

  try {
    return JSON.parse(payload);
  } catch (err) {
    console.warn('[Alba] JSON parse failed for wrapped payload');
    return null;
  }
}

/**
 * Estimate savings based on usage and settings
 */
function estimateSavingsFromUsage(totals = {}, settings = {}) {
  const profileSavings = { small: 0.35, balanced: 0.25, large: 0.15 };
  const profileKey = settings.modelProfile || 'balanced';
  const baseRate = profileSavings[profileKey] ?? 0.2;
  const optimizerBonus = settings.optimizerEnabled ? 0.1 : 0;
  const remoteBonus = settings.remoteOptimizer ? 0.05 : 0;
  const rate = Math.min(0.9, baseRate + optimizerBonus + remoteBonus);

  return {
    Wh: (totals.Wh || 0) * rate,
    gCO2: (totals.gCO2 || 0) * rate,
    waterMl: (totals.waterMl || 0) * rate,
    rate
  };
}

/**
 * Build fallback wrapped content when AI is unavailable
 */
function buildFallbackWrapped(totals, savings, dateLabel) {
  const resolvedSavings = savings || estimateSavingsFromUsage(totals);
  const kWhSaved = resolvedSavings.Wh / 1000;
  const ledMinutesSaved = resolvedSavings.Wh > 0 ? (resolvedSavings.Wh / 0.008).toFixed(1) : '0';
  const phoneChargesSaved = resolvedSavings.Wh > 0 ? (resolvedSavings.Wh / 11).toFixed(1) : '0';
  const scooterKmSaved = resolvedSavings.gCO2 > 0 ? (resolvedSavings.gCO2 / 12).toFixed(1) : '0';
  const showerMl = 9500;
  const waterPercSaved = showerMl ? ((resolvedSavings.waterMl / showerMl) * 100).toFixed(1) : '0';
  const bottleRefills = resolvedSavings.waterMl > 0 ? (resolvedSavings.waterMl / 500).toFixed(1) : '0';

  return {
    headline: `Alba Eco Wrapped`,
    subhead: resolvedSavings.Wh
      ? `Optimizing kept ${resolvedSavings.Wh.toFixed(2)} Wh (${kWhSaved.toFixed(3)} kWh) off the grid today.`
      : 'No recorded savings yet — keep nudging prompts leaner and they\'ll show up here.',
    cards: [
      {
        title: 'Energy Giveback',
        statLabel: 'Wh saved',
        statValue: `${resolvedSavings.Wh.toFixed(2)} Wh`,
        analogy: resolvedSavings.Wh
          ? `Enough electricity saved to keep LED lights off for ${ledMinutesSaved} minutes and skip ${phoneChargesSaved} phone charges.`
          : 'As soon as optimizations land, you\'ll see your watt savings here.',
        tip: 'Batch similar asks so you don\'t boot a fresh model for each one.'
      },
      {
        title: 'Carbon Cut',
        statLabel: 'CO2 saved',
        statValue: `${resolvedSavings.gCO2.toFixed(2)} g`,
        analogy: resolvedSavings.gCO2
          ? `Avoided the CO2 from a ${scooterKmSaved} km e-scooter trip by reusing context.`
          : 'Log a prompt and reuse context to start charting carbon cuts.',
        tip: 'Accept optimizer tips or trim drafts before sending.'
      },
      {
        title: 'Water Steward',
        statLabel: 'Water saved',
        statValue: `${resolvedSavings.waterMl.toFixed(0)} mL`,
        analogy: resolvedSavings.waterMl
          ? `Protected about ${waterPercSaved}% of a short shower — roughly ${bottleRefills} reusable bottles.`
          : 'Keep prompts concise to see water savings ripple outward.',
        tip: 'Stay text-first and avoid unnecessary regenerations.'
      }
    ],
    cta: 'Reuse context, embrace optimizer tips, and bank even more savings tomorrow.',
    footnote: 'Estimates use Alba defaults only — treat this as a savings snapshot, not a utility bill.'
  };
}

/**
 * Generate wrapped summary via the proxy, with local fallback.
 */
async function generateWrappedSummary(totals, dateLabel, settings = {}) {
  const metrics = {
    Wh: Number(totals.Wh) || 0,
    gCO2: Number(totals.gCO2) || 0,
    waterMl: Number(totals.waterMl) || 0
  };
  const savings = estimateSavingsFromUsage(metrics, settings);

  // If proxy not configured, return fallback immediately
  if (!isConfigured()) {
    return buildFallbackWrapped(metrics, savings, dateLabel);
  }

  const result = await callProxy('wrapped', {
    payload: { dateLabel, totals: metrics, savings }
  });

  if (result) {
    const parsed = extractJson(result);
    if (parsed) {
      return parsed;
    }
  }

  // Fallback if proxy fails or returns unparseable content
  return buildFallbackWrapped(metrics, savings, dateLabel);
}

// Export for use in content.js (contract unchanged)
globalThis.ALBA_AI_CLIENT = {
  isConfigured,
  optimizePrompt,
  generateWrappedSummary,
  estimateSavingsFromUsage,
  buildFallbackWrapped
};
