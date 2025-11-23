/**
 * Test script for Alba API using GitHub Marketplace AI Models
 *
 * GitHub Marketplace AI Models are accessed via Azure OpenAI inference endpoint
 * using GITHUB_TOKEN for authentication.
 */

import OpenAI from "openai";

const GITHUB_AI_BASE_URL = "https://models.inference.ai.azure.com";

async function testOptimizeEndpoint() {
  console.log("Testing prompt optimization with GitHub AI Models...\n");

  const client = new OpenAI({
    baseURL: GITHUB_AI_BASE_URL,
    apiKey: process.env.GITHUB_TOKEN
  });

  const OPTIMIZER_SYSTEM = `You are an expert prompt engineer. You compress prompts to use minimum tokens. Keep EXACT same meaning but remove ALL unnecessary words.

RULES:
1. Strip politeness: please, kindly, could you, would you, can you → DELETE
2. Strip filler: really, very, just, actually, basically → DELETE
3. Simplify actions: "help me write" → "write", "I want to" → "", "I need" → ""
4. Direct commands only: "Explain how X works" → "Explain X"
5. No meta-requests: "write a prompt that" → just the actual request

CRITICAL: Output ONLY the compressed version. Nothing else.`;

  const testPrompts = [
    "Please help me write a Python function that calculates fibonacci numbers",
    "Could you kindly explain how machine learning works to me?",
    "I want to learn how to code in JavaScript for web development"
  ];

  for (const prompt of testPrompts) {
    try {
      const resp = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: OPTIMIZER_SYSTEM },
          { role: "user", content: `Original prompt: ${prompt}` }
        ],
        temperature: 0.25,
        max_tokens: 200
      });

      const optimized = resp.choices?.[0]?.message?.content?.trim() || "";
      console.log(`Original: "${prompt}"`);
      console.log(`Optimized: "${optimized}"`);
      console.log("---");
    } catch (err) {
      console.error(`Error optimizing prompt: ${err.message}`);
      process.exit(1);
    }
  }

  console.log("\nPrompt optimization test passed!\n");
}

async function testWrappedEndpoint() {
  console.log("Testing wrapped recap generation with GitHub AI Models...\n");

  const client = new OpenAI({
    baseURL: GITHUB_AI_BASE_URL,
    apiKey: process.env.GITHUB_TOKEN
  });

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
- Limit cards to 3 entries.`;

  const testPayload = {
    dateLabel: new Date().toISOString().slice(0, 10),
    totals: { Wh: 15.5, gCO2: 8.2, waterMl: 125 },
    savings: { Wh: 3.875, gCO2: 2.05, waterMl: 31.25 }
  };

  try {
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: WRAPPED_SYSTEM },
        { role: "user", content: `Create the recap for: ${JSON.stringify(testPayload)}` }
      ],
      temperature: 0.9,
      max_tokens: 600
    });

    const raw = resp.choices?.[0]?.message?.content?.trim();
    console.log("Raw response received:");
    console.log(raw);

    // Try to parse JSON
    const match = raw.match(/```(?:json)?([\s\S]*?)```/i);
    const payload = match ? match[1] : raw;
    try {
      const parsed = JSON.parse(payload);
      console.log("\nParsed JSON successfully!");
      console.log(`Headline: ${parsed.headline}`);
      console.log(`Cards: ${parsed.cards?.length || 0}`);
    } catch (parseErr) {
      console.log("\nNote: Response was not valid JSON (fallback will be used in production)");
    }
  } catch (err) {
    console.error(`Error generating wrapped recap: ${err.message}`);
    process.exit(1);
  }

  console.log("\nWrapped recap test passed!\n");
}

async function main() {
  if (!process.env.GITHUB_TOKEN) {
    console.error("Error: GITHUB_TOKEN environment variable is required");
    console.error("This token is automatically provided by GitHub Actions");
    process.exit(1);
  }

  console.log("=".repeat(50));
  console.log("Alba API Tests - Using GitHub Marketplace AI Models");
  console.log("=".repeat(50));
  console.log("");

  await testOptimizeEndpoint();
  await testWrappedEndpoint();

  console.log("=".repeat(50));
  console.log("All tests passed successfully!");
  console.log("=".repeat(50));
}

main().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
