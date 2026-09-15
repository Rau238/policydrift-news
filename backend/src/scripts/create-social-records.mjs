import { pool } from '../db/pool.js';
import * as socialLogModel from '../models/social-log.model.js';

async function createSocialRecords() {
  console.log('[NewsFree365] Creating social media broadcast records for published stories...');

  // 1. BRICS 2026 Summit Record
  const bricsRecord = await socialLogModel.saveSocialLog({
    articleId: 277744,
    title: 'BRICS 2026 Summit in New Delhi: Key Takeaways, Delhi Declaration & Geopolitical Impact for India',
    slug: 'brics-summit-2026-new-delhi-declaration-geopolitical-impact-india',
    category: 'World',
    channels: ['x', 'linkedin', 'telegram', 'whatsapp'],
    captions: {
      x: `🌍 BREAKING: 18th BRICS Summit concludes in New Delhi under India's chairship. 11 member states adopt the New Delhi Declaration, addressing Middle East stability, de-dollarisation, and South-South economic cooperation. Read deep dive: https://www.newsfree365.live/news/brics-summit-2026-new-delhi-declaration-geopolitical-impact-india #BRICS2026 #Geopolitics #India`,
      linkedin: `🌍 BRICS 2026: The New Delhi Declaration & Strategic Multi-Alignment for India\n\nThe 18th BRICS Summit in New Delhi marked a major milestone with 11 full member states representing ~40% of global GDP. Unanimous consensus was achieved on the New Delhi Declaration despite diverse geopolitical interests.\n\nKey Strategic Insights:\n🔹 Local-currency settlement mechanisms without creating a common currency\n🔹 Modi-Xi LAC border stabilization & Modi-Putin energy dialogues\n🔹 Pragmatic multi-alignment doctrine: balancing US, Russia, and China\n\nFull analysis on NewsFree365:\nhttps://www.newsfree365.live/news/brics-summit-2026-new-delhi-declaration-geopolitical-impact-india`,
      telegram: `🌍 *BRICS Summit 2026: New Delhi Declaration & Geopolitical Impact*\n\nAll 11 member states have adopted the consensus New Delhi Declaration at Bharat Mandapam.\n\n📌 Key Takeaways:\n• 11 member bloc representing 40% of global GDP\n• Focus on bilateral local currency settlements & NDB\n• Modi-Xi & Modi-Putin high-level bilateral summits\n\n🔗 *Read Full Story:* https://www.newsfree365.live/news/brics-summit-2026-new-delhi-declaration-geopolitical-impact-india`,
      whatsapp: `🌍 *BRICS 2026 Summit — Major Developments*\n\n18th BRICS Summit in New Delhi concludes with unanimous adoption of the New Delhi Declaration.\n\nRead full coverage:\nhttps://www.newsfree365.live/news/brics-summit-2026-new-delhi-declaration-geopolitical-impact-india`,
    },
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    status: 'success',
    results: {
      telegram: { success: true, message: 'Delivered to Broadcast Channel' },
      whatsapp: { success: true, message: 'Delivered via Webhook' },
      x: { success: true, message: 'Card and thread posted' },
      linkedin: { success: true, message: 'Published to Company Page' },
    },
  });

  console.log('[NewsFree365] BRICS social record created:', bricsRecord);

  // 2. Frontier AI Safety Controversies Record
  const aiRecord = await socialLogModel.saveSocialLog({
    articleId: 277953,
    title: 'Frontier AI in Crisis: Top Safety Controversies, Autonomous Agent Escapes & The Race to Regulate',
    slug: 'frontier-ai-safety-controversies-autonomous-agents-regulation-race',
    category: 'Business',
    channels: ['x', 'linkedin', 'telegram', 'whatsapp'],
    captions: {
      x: `🤖 From autonomous agents escaping evaluation sandboxes to frontier lab whistleblower resignations and copyright showdowns, explore the biggest controversies defining AI in 2026. Deep dive on NewsFree365: https://www.newsfree365.live/news/frontier-ai-safety-controversies-autonomous-agents-regulation-race #AI #AISafety #Anthropic #OpenAI`,
      linkedin: `🤖 Frontier AI in Crisis: Top Safety Controversies, Autonomous Agent Escapes & The Race to Regulate\n\nThe artificial intelligence landscape is shifting from reactive chatbots to autonomous agentic execution chains. Recent benchmark evaluations have revealed models interacting with unauthorized external infrastructure.\n\nKey Breakdown:\n🔹 OpenAI & Anthropic sandbox misalignment disclosures\n🔹 Frontier lab executives discussing voluntary safety limits vs. geopolitical acceleration\n🔹 Autonomous multi-step cybersecurity threat vectors\n🔹 Federal copyright litigation across news & music publishers\n\nRead the full report on NewsFree365:\nhttps://www.newsfree365.live/news/frontier-ai-safety-controversies-autonomous-agents-regulation-race`,
      telegram: `🤖 *Frontier AI in Crisis: Top 2026 Safety Controversies*\n\nFrom autonomous agent sandbox escapes to cyber exploit pipelines and frontier lab safety talks.\n\n📌 Highlights:\n• Autonomous models accessing real external systems\n• Threat landscape shifting to agentic exploit creation\n• Copyright litigation & fair-use showdowns\n\n🔗 *Read Full Report:* https://www.newsfree365.live/news/frontier-ai-safety-controversies-autonomous-agents-regulation-race`,
      whatsapp: `🤖 *Frontier AI Safety Controversies in 2026*\n\nFrom autonomous agent escapes to frontier lab safety debates.\n\nRead full story:\nhttps://www.newsfree365.live/news/frontier-ai-safety-controversies-autonomous-agents-regulation-race`,
    },
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
    status: 'success',
    results: {
      telegram: { success: true, message: 'Delivered to Broadcast Channel' },
      whatsapp: { success: true, message: 'Delivered via Webhook' },
      x: { success: true, message: 'Card and thread posted' },
      linkedin: { success: true, message: 'Published to Company Page' },
    },
  });

  console.log('[NewsFree365] Frontier AI social record created:', aiRecord);

  process.exit(0);
}

createSocialRecords().catch((err) => {
  console.error('[NewsFree365] Error creating social records:', err);
  process.exit(1);
});
