import { getAiSettings } from '../models/ai-config.model.js';

/**
 * AI Service for NewsFree365 Editorial Suite
 * Supports Groq, Google Gemini API, and OpenAI API with multi-provider fallback.
 */

/**
 * Calls Groq REST API (OpenAI Compatible, Ultra-fast, 100% Free Tier)
 */
async function callGroq(systemPrompt, userPrompt, customConfig = {}) {
  const settings = await getAiSettings();
  const apiKey = (customConfig.apiKey || settings.groq_api_key || '').trim();
  if (!apiKey) {
    throw new Error('Groq API Key is not configured');
  }

  const model = customConfig.model || settings.groq_model || 'llama-3.3-70b-versatile';
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}

/**
 * Calls Google Gemini REST API
 */
async function callGemini(systemPrompt, userPrompt, customConfig = {}) {
  const settings = await getAiSettings();
  const apiKey = (customConfig.apiKey || settings.gemini_api_key || '').trim();
  if (!apiKey) {
    throw new Error('Gemini API Key is not configured');
  }

  const model = customConfig.model || settings.gemini_model || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nTask:\n${userPrompt}` }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2500,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) {
    throw new Error('Gemini returned an empty candidate response');
  }
  return text;
}

/**
 * Calls OpenAI API
 */
async function callOpenAI(systemPrompt, userPrompt, customConfig = {}) {
  const settings = await getAiSettings();
  const apiKey = (customConfig.apiKey || settings.openai_api_key || '').trim();
  if (!apiKey) {
    throw new Error('OpenAI API Key is not configured');
  }

  const model = customConfig.model || settings.openai_model || 'gpt-4o-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}

/**
 * Test connectivity and latency for a specific AI provider
 */
export async function testAIProvider({ provider, apiKey, model }) {
  const startTime = Date.now();
  const testSys = 'You are a test assistant. Answer with only: "OK"';
  const testUser = 'Ping';

  let responseText = '';
  if (provider === 'groq') {
    responseText = await callGroq(testSys, testUser, { apiKey, model });
  } else if (provider === 'gemini') {
    responseText = await callGemini(testSys, testUser, { apiKey, model });
  } else if (provider === 'openai') {
    responseText = await callOpenAI(testSys, testUser, { apiKey, model });
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const latencyMs = Date.now() - startTime;
  return {
    ok: true,
    provider,
    model: model || 'default',
    latency_ms: latencyMs,
    sample: responseText.slice(0, 50).trim(),
  };
}

/**
 * Universal text generation with multi-provider fallback
 */
export async function generateAIText(systemPrompt, userPrompt) {
  const settings = await getAiSettings();

  const providers = [];
  const priorityList = (settings.provider_priority || 'groq,gemini,openai')
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  for (const p of priorityList) {
    if (p === 'groq' && settings.groq_api_key) providers.push({ name: 'groq', fn: callGroq });
    if (p === 'gemini' && settings.gemini_api_key) providers.push({ name: 'gemini', fn: callGemini });
    if (p === 'openai' && settings.openai_api_key) providers.push({ name: 'openai', fn: callOpenAI });
  }

  // Also include any configured providers not explicitly in priority list
  if (settings.groq_api_key && !providers.some((x) => x.name === 'groq')) {
    providers.push({ name: 'groq', fn: callGroq });
  }
  if (settings.gemini_api_key && !providers.some((x) => x.name === 'gemini')) {
    providers.push({ name: 'gemini', fn: callGemini });
  }
  if (settings.openai_api_key && !providers.some((x) => x.name === 'openai')) {
    providers.push({ name: 'openai', fn: callOpenAI });
  }

  if (providers.length === 0) {
    throw new Error(
      'No AI provider configured. Please set GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in Admin Settings or backend/.env',
    );
  }

  const errors = [];
  for (const { name, fn } of providers) {
    try {
      const result = await fn(systemPrompt, userPrompt);
      if (result) return result;
    } catch (err) {
      console.warn(`[AI Service] ${name} call failed:`, err.message);
      errors.push(`${name}: ${err.message}`);
    }
  }

  throw new Error(`All AI providers failed: ${errors.join(' | ')}`);
}

/**
 * Clean & Parse JSON from LLM response markdown wrappers
 */
function extractJson(text) {
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  }

  // Find outer JSON object braces if extra surrounding text exists
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(clean);
}

/**
 * Generate full editorial article from a prompt or raw text
 */
export async function generateArticle({ prompt, category = 'general', tone = 'authoritative', post_kind = 'standard' }) {
  const systemPrompt = `You are a world-class senior news editor and policy journalist for NewsFree365.
Your task is to write high-authority, accurate, and comprehensive news articles and analytical deep-dives.
Respond ONLY with a valid, parseable JSON object with NO surrounding markdown or backticks.

Schema requirements:
{
  "title": "Compelling, high-CTR news headline (max 90 chars)",
  "excerpt": "Crisp 1-2 sentence executive summary (max 180 chars)",
  "body": "Full article formatted in clean HTML (<p>, <h2>, <h3>, <ul>, <li>, <blockquote>, <strong>). Include 3-5 distinct sub-sections. At least 450-800 words.",
  "key_takeaways": ["Takeaway bullet 1", "Takeaway bullet 2", "Takeaway bullet 3", "Takeaway bullet 4"],
  "category": "business|technology|politics|world|markets|sports|economy|defence|science|auto|general",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "seo_meta_title": "SEO Optimized Title",
  "seo_meta_desc": "SEO Meta Description",
  "reading_time_minutes": 4
}`;

  const userPrompt = `Topic / Headline / Raw Facts:
"${prompt}"

Category hint: ${category}
Tone: ${tone}
Story Type: ${post_kind}`;

  const rawText = await generateAIText(systemPrompt, userPrompt);
  return extractJson(rawText);
}

/**
 * Improve / Rewrite existing article text
 */
export async function improveContent({ content, instruction = 'Polish for professional journalism tone and fix grammar' }) {
  const systemPrompt = `You are an expert news editor. Improve the provided news article content according to the requested instruction.
Maintain HTML formatting (<p>, <h2>, <h3>, <ul>, <li>, <strong>, <blockquote>).
Respond ONLY with a valid JSON object:
{
  "improved_html": "<p>Enhanced HTML content...</p>",
  "summary_of_changes": "Brief summary of enhancements made"
}`;

  const userPrompt = `Instruction: ${instruction}

Existing Content:
${content}`;

  const rawText = await generateAIText(systemPrompt, userPrompt);
  return extractJson(rawText);
}

/**
 * Extract Key Takeaways & FAQs from content
 */
export async function extractTakeawaysAndFaqs({ title, body }) {
  const systemPrompt = `You are a news analyst. Extract key bullet takeaways and reader FAQs from the provided article.
Respond ONLY with a valid JSON object:
{
  "key_takeaways": ["Bullet point 1", "Bullet point 2", "Bullet point 3", "Bullet point 4"],
  "faqs": [
    { "question": "Clear reader question?", "answer": "Concise factual answer." },
    { "question": "Another key question?", "answer": "Concise factual answer." }
  ]
}`;

  const userPrompt = `Article Title: ${title}

Article Body:
${body}`;

  const rawText = await generateAIText(systemPrompt, userPrompt);
  return extractJson(rawText);
}

/**
 * Generate Social Media Broadcasts (Twitter/X, LinkedIn, Telegram)
 */
export async function generateSocialPosts({ title, excerpt, url = 'https://www.newsfree365.live' }) {
  const systemPrompt = `You are a viral news distribution strategist. Create tailored social media posts for Twitter/X, LinkedIn, and Telegram for the following news story.
Respond ONLY with a valid JSON object:
{
  "twitter": "Engaging punchy tweet with relevant hashtags and emojis (max 270 chars)",
  "linkedin": "Professional LinkedIn summary breakdown with bullet points, insights, and discussion question",
  "telegram": "Formatted Telegram broadcast message with markdown bolding and bullet highlights"
}`;

  const userPrompt = `Headline: ${title}
Summary: ${excerpt}
Link: ${url}`;

  const rawText = await generateAIText(systemPrompt, userPrompt);
  return extractJson(rawText);
}
