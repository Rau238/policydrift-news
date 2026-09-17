import { pool } from '../db/pool.js';
import * as postModel from '../models/post.model.js';
import crypto from 'crypto';

async function publishCryptoClarityArticle() {
  console.log('[NewsFree365] Publishing US Crypto CLARITY Act Analysis...');

  const slug = 'us-crypto-clarity-act-stalls-senate-bitcoin-impact';
  const title = '🇺🇸 US Crypto CLARITY Act Stalls in Senate: What Happened and Why It Matters for Bitcoin and Crypto';
  const category = 'Business';
  const excerpt = 'The US Digital Asset Market CLARITY Act fell short in a 50-49 Senate procedural vote needing 60 votes to advance. Here is what happened, why political ethics became a flashpoint, and how Bitcoin and crypto markets reacted.';

  const keyTakeaways = [
    'The US Senate failed to advance the Digital Asset Market CLARITY Act in a 50–49 procedural vote, falling short of the 60-vote filibuster threshold.',
    'Four Republican senators joined Democrats in voting against cloture ahead of the November 2026 midterm elections.',
    'Ethics rules and conflict-of-interest protections concerning politicians and their crypto business ties became the primary point of contention.',
    'Bitcoin dropped more than 5% and shares of major crypto firms like Coinbase and Circle fell up to 10% following the procedural defeat.',
    'The legislation sought to draw permanent statutory lines between SEC (securities) and CFTC (commodities) jurisdiction, covering DeFi, stablecoins, and exchanges.',
    'While the bill is stalled rather than permanently dead, regulatory oversight remains concentrated in SEC and CFTC administrative actions.',
  ].join('\n');

  const timeline = [
    {
      time: 'March 2026',
      title: 'Joint SEC/CFTC Regulatory Guidance',
      description: 'Regulators issue joint interpretation classifying BTC, ETH, SOL, and XRP as digital commodities.',
    },
    {
      time: 'Sept 14, 2026',
      title: 'Bipartisan Draft Incorporates 126 Changes',
      description: 'Sponsors release updated text with bipartisan ethics safeguards and state AG enforcement authority.',
    },
    {
      time: 'Sept 15, 2026',
      title: 'Senate Procedural Cloture Vote Fails',
      description: 'The procedural motion to advance fails 50–49, falling 10 votes short of the required 60-vote threshold.',
    },
    {
      time: 'November 2026',
      title: 'Post-Midterms Legislative Horizon',
      description: 'Lawmakers face a tight calendar before midterm elections, leaving further action for a lame-duck session.',
    },
  ];

  const body = `**Washington | September 16, 2026**

The United States' attempt to establish a comprehensive regulatory framework for cryptocurrency has suffered a major setback after the **Digital Asset Market CLARITY Act failed to advance in the U.S. Senate**.

In a crucial procedural vote on September 15, senators voted **50–49 in favour of advancing the legislation**, but the measure needed **60 votes** to overcome the Senate's procedural hurdle.

Four Republican senators joined Democrats in opposing advancement of the bill.

The result doesn't permanently kill the CLARITY Act, but with Congress preparing to leave Washington ahead of the November midterm elections, its immediate path forward has become considerably more difficult.

---

## What is the CLARITY Act?

The **Digital Asset Market CLARITY Act** is one of the most consequential attempts yet to establish permanent rules for America's cryptocurrency industry.

At its core, the legislation seeks to answer a question that has troubled the US crypto market for years:

> **When is a cryptocurrency a security, when is it a commodity, and which regulator should oversee it?**

The framework would establish statutory rules governing digital assets and clarify responsibilities between America's two major financial-market regulators:

- **SEC** — Securities and Exchange Commission
- **CFTC** — Commodity Futures Trading Commission

The legislation also covers crypto exchanges and intermediaries, consumer protections, illicit-finance controls and parts of the decentralized-finance ecosystem.

---

## Why did the Senate vote fail?

The controversy surrounding the legislation extends beyond cryptocurrency regulation itself.

One of the biggest sticking points became **ethics rules governing politicians and their financial involvement with crypto**.

President Donald Trump's family's involvement in cryptocurrency businesses and digital tokens became a major point of disagreement during negotiations.

Ahead of the vote, Trump agreed to additional ethics restrictions as lawmakers attempted to find enough bipartisan support to advance the legislation.

The final draft released on September 14 incorporated substantial portions of a bipartisan ethics proposal and gave **state attorneys general a role in enforcement**.

Republican sponsors said the final legislation incorporated **126 substantive changes requested by Democrats**.

Nevertheless, the changes were not enough to secure the required 60 votes.

Some Democratic lawmakers and outside watchdog groups argued that the protections still did not adequately address potential conflicts involving existing cryptocurrency businesses and financial interests.

Supporters of the legislation disputed that assessment and argued that the bill contained substantial consumer, ethics, anti-money-laundering and enforcement protections.

---

## Bitcoin reacted immediately

Financial markets noticed.

As it became clear that the legislation would fail to advance, **Bitcoin dropped more than 5%**, according to Reuters.

Shares of major US cryptocurrency companies were also hit:
- **Coinbase** fell as much as approximately 10% during trading.
- Stablecoin issuer **Circle** saw similar double-digit market declines.

That reaction demonstrates how critical regulatory clarity has become to the institutional cryptocurrency investment thesis. The market had hoped that legislation could replace years of regulatory ambiguity with permanent rules enacted by Congress.

---

## Why does the crypto industry want the CLARITY Act?

The American cryptocurrency industry has long voiced frustration over what it describes as **"regulation through enforcement"**.

Crypto companies want Congress to establish unambiguous statutory definitions distinguishing:

- **Digital Commodity**
- **Security**
- **Payment Stablecoin**
- **DeFi Protocol**

...and determine which federal regulator controls each category.

Without legislation, much of America's crypto framework continues to depend on shifting administrative determinations made by individual SEC and CFTC commissioners. That matters because administrative interpretations can change when presidential administrations change. Congressional statutes, by contrast, provide durable multi-decade certainty.

---

## SEC vs CFTC: The jurisdictional divide

For years, the fundamental question in US crypto policy has been institutional turf:

- The **SEC** regulates investment securities and disclosures.
- The **CFTC** regulates commodity derivatives and ensures market integrity in spot commodity markets.

Because digital tokens blend utility, store-of-value, and investment contract characteristics, they rarely fit cleanly into century-old legal doctrines like the 1946 *Howey* test.

The CLARITY framework attempted to establish an objective pathway:
1. **Exchange Registration:** Allowing platforms to operate dual registration pathways.
2. **Developer Safe Harbors:** Protecting non-custodial open-source software authors from being treated as regulated money transmitters.
3. **Institutional Custody:** Providing clear compliance rails for Tier-1 depository institutions.

---

## DeFi was another major battleground

The September version of the legislation also contained significant provisions concerning **decentralized finance (DeFi)**.

The updated text addressed circumstances in which non-fully-decentralized DeFi interfaces would have to register with the CFTC and comply with Bank Secrecy Act (BSA) obligations, while safeguarding non-custodial smart contract deployers.

A major legal dilemma remains:

> **Should an engineer who merely writes open-source decentralized code be regulated like a commercial bank or broker-dealer?**

The legislation attempted to distinguish between decentralized protocol creators and commercial intermediaries who maintain direct control over user custody or transaction routing.

---

## What happens now?

Key clarifications regarding the vote outcome:

- ❌ **The CLARITY Act has NOT become law.**
- ❌ **The Senate did NOT definitively kill the underlying bill.**
- ✅ **A procedural motion (cloture) failed to reach the required 60 votes.**

The 50–49 result means the bill is **stalled**, not dead. Senator Thom Tillis strategically voted "no" to preserve the procedural right to bring the motion up for reconsideration. However, with the upcoming November 2026 midterm elections, the available legislative floor time is extremely limited.

---

## What this means for Ethereum, Solana, and XRP

This development is especially critical for digital assets beyond Bitcoin.

While Bitcoin is universally recognized as a digital commodity, assets such as **Ether, Solana, and XRP** have historically faced shifting regulatory interpretations. While the SEC and CFTC issued joint interpretive guidance in March 2026 treating them as commodities, administrative guidance lacks the force of permanent congressional statute and could theoretically be amended by future commissions.

---

## Global and Indian Market Implications

Although this is domestic US legislation, the ramifications are global:
- **Global Liquidity:** The US represents the largest institutional capital pool. Regulatory stalemates in Washington delay full-scale balance-sheet integration by global investment banks.
- **Cross-Border Standards:** Regulators in India, the EU, and East Asia closely monitor the US demarcation between commodities, securities, and stablecoins as they refine their own digital asset frameworks.

---

## Editorial Outlook

The procedural setback for the CLARITY Act highlights the evolving complexity of crypto politics. What began as a debate over securities law has broadened into a battle over **political ethics, financial disclosures, and systemic consumer protection**.

Until Congress acts, the burden of regulating America's trillion-dollar digital asset economy returns squarely to the SEC and CFTC—leaving the market in a familiar state of watchful anticipation.

<!-- STORY_TIMELINE:${JSON.stringify(timeline)} -->`;

  const tags = JSON.stringify([
    'Crypto',
    'Bitcoin',
    'CLARITY Act',
    'US Senate',
    'SEC',
    'CFTC',
    'Ethereum',
    'Coinbase',
    'Fintech',
    'Regulation',
    'Business News',
  ]);

  const imageUrl = 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80';

  const totalWords = `${title} ${excerpt} ${body}`.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(totalWords / 200));

  const urlHash = crypto.createHash('sha256').update(slug + ':' + Date.now()).digest('hex');
  const contentHash = crypto.createHash('sha256').update(title + ':' + body.slice(0, 500)).digest('hex');

  // Check if article already exists with this slug
  const existing = await postModel.findBySlug(slug);
  if (existing) {
    console.log(`[NewsFree365] Article already exists (ID: ${existing.id}). Updating...`);
    await pool.query(
      `UPDATE posts SET title=?, excerpt=?, key_takeaways=?, body=?, image_url=?, category=?, status=?, published_at=?, is_featured=?, is_breaking=?, editorial_priority=?, tags=? WHERE id=?`,
      [title, excerpt, keyTakeaways, body, imageUrl, category, 'published', new Date(), 1, 1, 'pinned', tags, existing.id]
    );
    console.log(`[NewsFree365] Article ID ${existing.id} updated and published successfully!`);
  } else {
    const newId = await postModel.createPost({
      slug,
      title,
      excerpt,
      key_takeaways: keyTakeaways,
      body,
      original_url: 'https://www.newsfree365.live/news/' + slug,
      url_hash: urlHash,
      content_hash: contentHash,
      image_url: imageUrl,
      category,
      published_at: new Date(),
      source_feed: 'NewsFree365 Editorial Desk',
      source_id: null,
      status: 'published',
      auto_published: 0,
      reading_time_minutes: readingTime,
      author: 'NewsFree365 Editorial Desk',
      tags,
      is_featured: 1,
      featured_until: new Date(Date.now() + 72 * 3600 * 1000), // 3 days
      is_breaking: 1,
      breaking_until: new Date(Date.now() + 24 * 3600 * 1000), // 24 hours
      editorial_priority: 'pinned',
    });
    console.log(`[NewsFree365] Article created and published with ID: ${newId}!`);
  }

  process.exit(0);
}

publishCryptoClarityArticle().catch((err) => {
  console.error('[NewsFree365] Error publishing article:', err);
  process.exit(1);
});
