import { env } from '../config/env.js';
import { normalizeOpenAIContent, toCleanString } from '../utils/string.js';

function stripHtml(html) {
  const h = toCleanString(html);
  if (!h) return '';
  return h
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(s) {
  const t = toCleanString(s);
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clampLine(s, maxLen) {
  const x = toCleanString(s);
  if (x.length <= maxLen) return x;
  const cut = x.lastIndexOf(' ', maxLen - 2);
  return (cut > 24 ? x.slice(0, cut) : x.slice(0, maxLen - 1)) + '…';
}

/** Split RSS/plain text into short lines for bullets (handles single-block wires). */
function linesForBullets(plain, title) {
  const t = toCleanString(plain) || toCleanString(title);
  if (!t) return [];

  const blocks = t.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const sentences = [];
  for (const block of blocks) {
    const parts = block.split(/(?<=[.!?])\s+/);
    for (const p of parts) {
      const s = p.trim();
      if (s.length > 10 && s.length < 600) sentences.push(s);
    }
  }

  if (sentences.length >= 3) return sentences;

  const words = t.split(/\s+/).filter(Boolean);
  const out = [...sentences];
  let buf = '';
  for (const w of words) {
    const next = buf ? `${buf} ${w}` : w;
    if (next.length > 130) {
      if (buf) out.push(buf);
      buf = w;
    } else {
      buf = next;
    }
  }
  if (buf) out.push(buf);
  return out.length ? out : [t.slice(0, 200)];
}

function uniqueNonEmpty(lines, max) {
  const seen = new Set();
  const out = [];
  for (const raw of lines) {
    const s = clampLine(raw, 200).trim();
    if (s.length < 12) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

function fallbackBlogHtml({ title, plain }) {
  const lines = linesForBullets(plain, title);
  const intro = clampLine(lines.slice(0, 2).join(' ') || title, 360);
  const introHtml = `<p>${escapeHtml(intro)}</p>`;

  const take = uniqueNonEmpty(lines.slice(0, 6), 5);
  const keyTakeaways =
    take.length >= 2
      ? take.slice(0, 4)
      : [
          clampLine(lines[0] || plain || title, 200),
          'Source details are summarized from the linked wire or publisher feed.',
        ];

  const bgSlice = lines.slice(Math.min(4, lines.length));
  const bgCandidates = uniqueNonEmpty(bgSlice, 5);
  const background =
    bgCandidates.length >= 2
      ? bgCandidates.slice(0, 4)
      : [
          clampLine(plain.slice(200, 700) || plain.slice(0, 220) || title, 220),
          'Full context often emerges as officials, markets, or courts add updates.',
        ];

  const tail = lines.slice(Math.max(0, lines.length - 4));
  const tailUnique = uniqueNonEmpty(tail, 4);
  const whyMatters =
    tailUnique.length >= 2
      ? tailUnique.slice(0, 3)
      : [
          'Puts this headline in context for policy, business, and regional readers.',
          'Watch for follow-up data, statements, or votes that change the trajectory.',
        ];

  const ul = (items) =>
    `<ul>${items.map((x) => `<li>${escapeHtml(clampLine(x, 220))}</li>`).join('')}</ul>`;

  return [
    introHtml,
    '<h2>Key takeaways</h2>',
    '<p>Quick scan — what you need to know:</p>',
    ul(keyTakeaways),
    '<h2>Background</h2>',
    '<p>What led here, in plain terms:</p>',
    ul(background),
    '<h2>Why it matters</h2>',
    '<p>Why readers and decision-makers should care:</p>',
    ul(whyMatters),
  ].join('\n');
}

const EDITOR_SYSTEM_PROMPT = `You are an editor for PolicyDrift, a clear news site. Rewrite the source into original, SEO-friendly HTML only.

Structure (use exactly these h2 titles, in this order):
1. One opening <p> (2–3 sentences, neutral, no hype).
2. <h2>Key takeaways</h2> then <p>Quick scan — what you need to know:</p> then <ul> with 3–5 <li> items. Each <li> must be ONE short line (under ~140 characters), plain language, no sub-bullets.
3. <h2>Background</h2> then <p>What led here, in plain terms:</p> then <ul> with 2–4 <li> short lines (context, timeline, who is involved — only if supported by the source).
4. <h2>Why it matters</h2> then <p>Why readers and decision-makers should care:</p> then <ul> with 2–3 <li> short lines (stakes, who is affected, what to watch next — stay factual to the source).

Rules: Use only <p>, <h2>, <ul>, <li>. No markdown, no code fences, no invented facts. If the source is thin, write shorter lists and say less rather than guessing.`;

/**
 * Rewrites RSS-derived text into SEO-oriented HTML.
 * Uses OpenAI when OPENAI_API_KEY is set; otherwise a structured fallback.
 */
export async function rewriteForSEO({ title, contentSnippet, link }) {
  title = toCleanString(title);
  link = toCleanString(link);
  const plain = stripHtml(contentSnippet) || title;
  const excerpt = plain.slice(0, 220) + (plain.length > 220 ? '…' : '');

  if (!env.OPENAI_API_KEY) {
    return {
      bodyHtml: fallbackBlogHtml({ title, plain }),
      excerpt,
    };
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      temperature: 0.35,
      messages: [
        { role: 'system', content: EDITOR_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Title: ${title}\nSource URL: ${link}\n\nSource text:\n${plain.slice(0, 8000)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  let bodyHtml = normalizeOpenAIContent(data.choices?.[0]?.message?.content).trim();
  bodyHtml = bodyHtml.replace(/^```html\s*/i, '').replace(/\s*```$/i, '');

  return {
    bodyHtml: bodyHtml || fallbackBlogHtml({ title, plain }),
    excerpt: excerpt || plain.slice(0, 220),
  };
}
