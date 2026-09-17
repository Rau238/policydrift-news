import { pool } from '../db/pool.js';
import * as postModel from '../models/post.model.js';
import crypto from 'crypto';

async function publishUpiMdrArticle() {
  console.log('[NewsFree365] Publishing UPI MDR 2026 Rule Analysis...');

  const slug = 'upi-charges-october-15-what-new-mdr-rule-means-india';
  const title = '🇮🇳 UPI Charges Are Coming From October 15: What the New 0.4% MDR Rule Means for India';
  const category = 'Business';
  const excerpt = 'NPCI has introduced a Merchant Discount Rate (MDR) of up to 0.4% on specified UPI payments to merchants above ₹2,000 starting October 15, 2026. Here is a breakdown of what changes for consumers, small shops, and fintechs.';

  const keyTakeaways = [
    'Eligible Person-to-Merchant (P2M) UPI transactions above ₹2,000 can attract an MDR of up to 0.4% starting October 15, 2026.',
    'Person-to-Person (P2P) transfers remain completely free with zero limits on transfer amounts.',
    'Merchant transactions up to ₹2,000 remain free — covering approximately 96% of all P2M UPI transactions.',
    'The MDR is strictly a merchant-side charge; consumers cannot be charged platform fees or UPI surcharges.',
    'Small merchants receiving up to ₹1 lakh per month through UPI QR codes are exempt and continue to enjoy zero MDR.',
    'MDR is capped at ₹300 for transactions of ₹75,000 and above, while key sectors like utilities and railways have a flat ₹5 fee.',
  ].join('\n');

  const timeline = [
    {
      time: 'August 2026',
      title: 'UPI Reaches Record Scale',
      description: 'UPI logs 24.5 billion monthly transactions worth ₹29.8 lakh crore across 550+ million users.',
    },
    {
      time: 'Sept 16, 2026',
      title: 'NPCI MDR Framework Outlined',
      description: 'NPCI announces a 0.4% MDR on high-value P2M transactions to help finance the ₹20,000 crore annual ecosystem cost.',
    },
    {
      time: 'October 15, 2026',
      title: 'New MDR Regime Takes Effect',
      description: 'Banks and payment service providers implement the new fee structure on eligible transactions.',
    },
  ];

  const body = `**New Delhi | September 16, 2026**

India's UPI payment system is entering a new phase. After more than six years of effectively zero-cost merchant transactions, the National Payments Corporation of India (NPCI) has introduced a **Merchant Discount Rate (MDR) of up to 0.4% on specified UPI payments to merchants above ₹2,000**.

The new framework will come into effect from **October 15, 2026**. Importantly, the charge is **not being imposed directly on consumers**. Person-to-person UPI transfers will remain completely free, regardless of the amount transferred.

---

## What exactly is changing?

Under the new framework, eligible **person-to-merchant (P2M)** UPI transactions above ₹2,000 can attract an MDR of up to **0.4%**.

For example:

| UPI Merchant Payment | Maximum MDR | Applicable Cap |
| :--- | :--- | :--- |
| **₹1,500** | ₹0 | Zero MDR threshold |
| **₹2,000** | ₹0 | Zero MDR threshold |
| **₹3,000** | ₹12 | 0.4% rate |
| **₹10,000** | ₹40 | 0.4% rate |
| **₹50,000** | ₹200 | 0.4% rate |
| **₹75,000** | ₹300 | ₹300 Cap reached |
| **₹1,00,000** | ₹300 | ₹300 Cap applied |
| **₹2,00,000** | ₹300 | ₹300 Cap applied |

*The MDR is capped at ₹300 for transactions of ₹75,000 and above.*

The critical distinction is that **the merchant, rather than the customer, is responsible for paying the MDR**.

The government has also explicitly stated that UPI apps cannot impose a separate platform fee or convenience fee on users for these transactions.

---

## Will I have to pay for UPI?

For ordinary users, **UPI remains completely free in almost all daily situations**.

### 1. Person-to-person (P2P) payments
Sending ₹5,000 to a friend, family member, landlord, or another individual's bank account will remain **free**. There is no transaction-value threshold or cap on P2P transfers.

### 2. Payments below ₹2,000
Merchant payments up to ₹2,000 will remain completely free under the new framework. Government data indicates that approximately **96% of P2M UPI transactions will remain unaffected**.

> **Consumer Reality Check:** The sensationalist headline *"UPI will now charge users"* is factually incorrect. The policy specifically alters the **merchant-side economics of selected higher-value commercial transactions**.

---

## Why has MDR been introduced?

UPI has evolved from an experimental mobile payment tool into the backbone of India's commercial economy and one of the world's largest real-time payment networks.

In August 2026 alone, UPI processed approximately **24.5 billion transactions worth ₹29.8 lakh crore**.

That immense scale comes with substantial operational and security costs. Banks, payment service providers (PSPs), and payment gateways must continuously finance:

- **High-throughput payment switches & servers**
- **Round-the-clock cybersecurity & fraud mitigation**
- **Disaster recovery & distributed data centres**
- **Continuous 99.99% uptime network reliability**
- **Customer grievance & chargeback support**
- **Biometric & two-factor authentication systems**

The government estimates that operating and securing UPI costs approximately **₹20,000 crore annually**.

The economic rationale behind MDR is that UPI cannot depend indefinitely on taxpayer subsidies, and commercial enterprises that benefit from zero-friction digital sales should contribute to maintaining the ecosystem. Former SBI chairman Rajnish Kumar noted that the cost of securing and upgrading the digital rails must be funded sustainably, while pointing out that UPI remains substantially cheaper for merchants than cash management or standard credit card interchange fees (which often range from 1.5% to 2.5%).

---

## But why are people worried?

The central concern among analysts and consumers is **whether merchants will eventually pass the cost onto customers indirectly**.

While formal regulations prohibit passing MDR as a surcharge, businesses could theoretically respond by:
1. Adjusting retail prices on higher-value items.
2. Imposing minimum transaction thresholds for UPI acceptance.
3. Encouraging customers to use cash for larger purchases.

This creates an important distinction:
- **Legally/Formally:** Customers pay zero UPI surcharges or convenience fees.
- **Economically:** Market pricing dynamics and merchant acceptance practices will require ongoing regulatory oversight.

The real-world market impact will become clearer once the policy goes live on October 15.

---

## Small merchants get full protection

The new framework does not apply uniformly across all commercial establishments.

**Small merchants receiving up to ₹1 lakh per month through UPI QR codes** under the designated small-merchant classification will continue to enjoy **zero MDR**.

This protection is crucial because India's digital payments revolution is powered by millions of local kirana shops, street vendors, and micro-entrepreneurs. The policy deliberately targets corporate retailers, large e-commerce platforms, and high-ticket merchant payments rather than daily neighborhood commerce.

---

## Special sectors receive concessional rates

To protect essential public services and regulated financial flows, several sectors have been granted lower fee structures:

- **Essential Utilities & Travel:** Transactions for Railways, Telecom, Insurance, Fuel stations, and Government utility bill payments will attract a **flat ₹5 MDR** on eligible transactions above ₹2,000 rather than the variable 0.4% rate.
- **Capital Markets:** Payments for mutual fund investments, equity purchases, and stockbroker accounts have been assigned a minimal rate of **0.02%**, subject to applicable caps.

---

## What about a ₹1 lakh payment?

This is where the regulatory ceiling provides cost predictability:

At the standard 0.4% rate, a ₹1,00,000 transaction would mathematically equal ₹400 in MDR. However, the NPCI framework caps the maximum MDR at **₹300 for any transaction of ₹75,000 and above**.

- **₹75,000:** Maximum ₹300
- **₹1,00,000:** Maximum ₹300
- **₹2,00,000:** Maximum ₹300

The ceiling prevents spiraling transaction costs on luxury goods, high-end electronics, or wholesale trade.

---

## Why this marks a turning point for India's digital economy

For nearly a decade, UPI's exponential growth was driven by a frictionless promise:

> **Scan QR → Enter PIN → Zero fees for anyone**

The new MDR regime shifts UPI toward a mature, financially sustainable model:

- **Small-ticket & P2P payments:** Completely free public infrastructure.
- **High-value commercial payments:** Funded by the merchant ecosystem.

This provides banks and PSPs with a predictable revenue model to reinvest in infrastructure resiliency and fraud prevention, ensuring UPI remains robust for the next 500 million users.

---

## What consumers should remember

If you are an everyday UPI user, your payment experience will not change:

- **Free P2P transfers:** Send money to friends, family, or personal accounts without charges.
- **Free everyday shopping:** Over 96% of merchant payments fall below ₹2,000 and remain zero-rated.
- **No app surcharges:** Third-party payment apps cannot charge platform fees for UPI payments under this rule.

---

## Editorial Outlook

The new UPI MDR framework is not the end of India's digital payments miracle—it is an evolution in **who finances the system**. 

As UPI handles nearly half of all real-time digital transactions globally, moving toward self-sustaining unit economics is a natural maturation. The success of this policy will depend on regulatory vigilance to ensure that banks and payment networks channel this revenue directly into network uptime, advanced fraud detection, and rural financial inclusion.

<!-- STORY_TIMELINE:${JSON.stringify(timeline)} -->`;

  const tags = JSON.stringify([
    'UPI',
    'NPCI',
    'Digital Payments',
    'Fintech',
    'MDR',
    'Banking',
    'Reserve Bank of India',
    'Indian Economy',
    'Business News',
    'Digital India',
  ]);

  const imageUrl = 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80';

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

publishUpiMdrArticle().catch((err) => {
  console.error('[NewsFree365] Error publishing article:', err);
  process.exit(1);
});
