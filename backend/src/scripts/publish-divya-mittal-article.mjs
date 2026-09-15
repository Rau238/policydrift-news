import { pool } from '../db/pool.js';
import * as postModel from '../models/post.model.js';
import { saveSocialLog } from '../models/social-log.model.js';
import crypto from 'crypto';

async function publishDivyaMittalArticle() {
  console.log('[NewsFree365] Publishing IAS Divya Mittal Resignation Analysis...');

  const slug = 'ias-officer-divya-mittal-resigns-13-years-public-service-civil-services-career-shift';
  const title = 'IIT, IIM to District Magistrate: Why IAS Officer Divya Mittal’s Resignation After 13 Years Reshapes the Civil Services Career Debate';
  const category = 'India';
  const excerpt = '2013-batch UP cadre IAS officer Divya Mittal resigns after 13 years of distinguished district administration. Her transition from IIT Delhi and IIM Bangalore through the civil services highlights evolving career paradigms, administrative pressures, and public policy retention.';

  const keyTakeaways = [
    'Central government accepted 2013-batch UP cadre IAS officer Divya Mittal’s resignation, submitted on August 30, 2026, citing family priorities and personal goals.',
    'Her administrative track record includes landmark tenures as District Magistrate in Deoria, Mirzapur, and Sant Kabir Nagar, notably resolving chronic water scarcity in Lahuriya Deh village.',
    'Possessing an elite academic pedigree (IIT Delhi → IIM Bangalore → UPSC CSE), her resignation ends 13 years of frontline governance.',
    'The move underscores a wider paradigm shift where premier professionals view civil services as an impactful chapter rather than an obligatory lifelong tenure.',
    'Civil service analysts emphasize the need for systemic retention reforms, sabbaticals, and hybrid policy roles to harness seasoned administrative expertise.',
  ].join('\n');

  const timeline = [
    {
      time: '2013',
      title: 'UPSC Civil Services Selection',
      description: 'Divya Mittal clears UPSC CSE and joins the premier Indian Administrative Service (IAS) in the Uttar Pradesh cadre.',
    },
    {
      time: '2019 – 2024',
      title: 'District Magistrate Tenures & Lahuriya Deh Project',
      description: 'Serves as DM in Sant Kabir Nagar, Mirzapur, and Deoria, winning widespread acclaim for rural water infrastructure delivery in Lahuriya Deh.',
    },
    {
      time: 'Aug 30, 2026',
      title: 'Submission of Formal Resignation',
      description: 'Submits voluntary resignation citing changing family commitments, personal priorities, and new life chapters.',
    },
    {
      time: 'Sept 15, 2026',
      title: 'Central Government Acceptance & National Discussion',
      description: 'DoPT and UP State Government formally accept the resignation, sparking constructive discourse on civil servant career mobility.',
    },
  ];

  const body = `The resignation of **2013-batch Uttar Pradesh cadre IAS officer Divya Mittal** has ignited widespread discussion across India's administrative, academic, and policy communities. Recognized for her proactive grassroots governance and exceptional academic pedigree (**IIT Delhi → IIM Bangalore → UPSC CSE**), Mittal's departure after **13 years of public service** marks a significant moment in the evolving narrative of India's premier civil services.

The central government and Department of Personnel and Training (DoPT) accepted her resignation, formally tendered on **August 30, 2026**, citing family commitments, personal priorities, and the desire to pursue new professional chapters.

---

## 🏛️ A Distinguished Decade of District Governance

During her 13-year administrative career, Divya Mittal served across high-responsibility roles in Uttar Pradesh, most notably as **District Magistrate (DM)** in:

* **Mirzapur**
* **Deoria**
* **Sant Kabir Nagar**

![Administrative District Headquarters & Public Governance in India](https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1200&q=80)

### The Lahuriya Deh Drinking Water Milestone
Among her most celebrated grassroots achievements was resolving a decades-long drinking water crisis in **Lahuriya Deh**, an arid, hilly village in Mirzapur district. For generations, residents had relied on expensive, irregular water tankers. Through dedicated inter-departmental coordination, geo-technical surveys, and rapid execution, piped drinking water was successfully delivered to every household—a milestone that earned widespread national commendation.

Beyond administrative duties, Mittal has been a dedicated mentor to lakhs of civil service aspirants, regularly sharing pragmatic advice on exam preparation, mental resilience, and public service ethics.

---

## 💼 The Academic Pedigree: IIT + IIM + IAS

Divya Mittal’s trajectory represents an elite academic trifecta:

1. **B.Tech from IIT Delhi**
2. **Post-Graduation from IIM Bangalore**
3. **High All-India Rank in UPSC Civil Services Examination**

Prior to entering the civil services, she worked in the financial sector, bringing a sharp quantitative and systems-oriented perspective to district administration.

| Phase | Institution / Role | Domain Focus |
| :--- | :--- | :--- |
| **Undergraduate** | Indian Institute of Technology (IIT) Delhi | Engineering & Analytical Foundations |
| **Management** | Indian Institute of Management (IIM) Bangalore | Corporate Strategy & Finance |
| **Civil Services** | Indian Administrative Service (2013 Batch, UP) | District Administration & Public Policy |
| **Next Chapter** | Policy Research, Mentorship & Public Impact | Social Innovation & Higher Education |

---

## 💬 The Bigger Picture: Why Seasoned Civil Servants Are Choosing Second Acts

The resignation of a mid-career IAS officer often triggers sensational speculation. However, seasoned observers recognize that Mittal’s move reflects a **mature, structural transformation in how modern professionals approach public service**.

![Indian Public Policy, Governance and Higher Education](https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80)

### 1. Civil Service as a Purposeful Chapter, Not a Lifelong Anchor
Traditionally, entering the IAS was viewed as a permanent 35-year commitment until superannuation. Today, professionals with versatile educational backgrounds view public service as an impactful chapter where they dedicate 10 to 15 years to national building before transitioning into:
* **Higher Education & Academia**
* **Public Policy Think Tanks & Global Development**
* **Social Impact Enterprises & Philanthropy**
* **Writing & Administrative Mentorship**

### 2. Work-Life Integration & Changing Life Priorities
The relentless 24/7 demands of district administration—managing law and order, flood relief, protocol, and citizen grievances—frequently extract a heavy personal and familial toll. Choosing to step back to focus on children, aging parents, and personal well-being is a legitimate, courageous decision that reflects healthy personal prioritization.

### 3. Retaining and Channeling Administrative Capital
An officer with over a decade of field experience possesses deep institutional knowledge of government machinery, rural development schemes, and public budget execution. 

> **Key Policy Question:**  
> *How can Indian governance frameworks evolve to offer seasoned officers flexible sabbaticals, hybrid advisory roles, or academic deputations so that their valuable administrative expertise remains accessible to public policy without requiring an outright resignation?*

---

## 🔥 The Core Takeaway: Resignation as Evolution, Not Exit

**Voluntary resignation from high office is not a retreat—it is a conscious evolution.**

Divya Mittal leaves behind a record of tangible public service, clean administration, and community impact. As she steps into her next phase—whether in education, public policy research, or social impact—her career trajectory demonstrates that true contribution to the nation extends far beyond the confines of official designations.

<!-- STORY_TIMELINE:${JSON.stringify(timeline)} -->`;

  const imageUrl = 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1200&q=80';
  const tags = JSON.stringify([
    'Divya Mittal',
    'IAS',
    'UPSC',
    'Uttar Pradesh',
    'Governance',
    'Civil Services',
    'Public Policy',
    'IIT Delhi',
    'IIM Bangalore',
    'India',
  ]);

  const totalWords = `${title} ${excerpt} ${body}`.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(totalWords / 200));

  const urlHash = crypto.createHash('sha256').update(slug + ':' + Date.now()).digest('hex');
  const contentHash = crypto.createHash('sha256').update(title + ':' + body.slice(0, 500)).digest('hex');

  // Check if article already exists
  const existing = await postModel.findBySlug(slug);
  let postId;

  if (existing) {
    console.log(`[NewsFree365] Article already exists (ID: ${existing.id}), updating content...`);
    postId = existing.id;
    await postModel.updatePost(postId, {
      title,
      excerpt,
      key_takeaways: keyTakeaways,
      body,
      image_url: imageUrl,
      category,
      status: 'published',
      published_at: new Date(),
      is_featured: 1,
      is_breaking: 0,
      editorial_priority: 'pinned',
      tags,
    });
  } else {
    console.log('[NewsFree365] Inserting new published article via postModel...');
    postId = await postModel.createPost({
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
      source_feed: 'NewsFree365 National Desk',
      source_id: null,
      status: 'published',
      auto_published: 0,
      reading_time_minutes: readingTime,
      author: 'NewsFree365 National Desk',
      tags,
      is_featured: 1,
      featured_until: new Date(Date.now() + 72 * 3600 * 1000),
      is_breaking: 0,
      editorial_priority: 'pinned',
    });
  }

  console.log(`[NewsFree365] Article published successfully! Post ID: ${postId}`);

  // Create Social Post Record in news_social_posts_log
  const socialTitle = 'IAS Officer Divya Mittal Resigns After 13 Years: Why It Matters for Civil Services & Public Policy';
  const socialCaptions = {
    x: `🇮🇳 2013-batch UP cadre IAS officer Divya Mittal (IIT Delhi → IIM Bangalore → IAS) resigns after 13 years of distinguished public service.\n\nFrom Mirzapur's Lahuriya Deh water project to district governance, what her career transition says about civil services in modern India:\n\nhttps://www.newsfree365.live/news/${slug}\n\n#IAS #DivyaMittal #UPSC #Governance #India #NewsFree365`,
    telegram: `<b>IAS Officer Divya Mittal Resigns After 13 Years</b>\n\nDivya Mittal, an IIT Delhi and IIM Bangalore alumna who served as DM in Deoria, Mirzapur, and Sant Kabir Nagar, has stepped down from the IAS after 13 years of public service.\n\nRead our in-depth analysis on civil services career transitions and governance retention:\n🔗 https://www.newsfree365.live/news/${slug}`,
    linkedin: `The resignation of 2013-batch IAS officer Divya Mittal (IIT Delhi / IIM Bangalore alumna) after 13 years of frontline district administration opens an important discussion on civil servant career mobility and public policy retention.\n\nRead the complete analysis on NewsFree365: https://www.newsfree365.live/news/${slug}`,
  };

  const socialLogId = await saveSocialLog({
    articleId: postId,
    title: socialTitle,
    slug,
    category,
    channels: ['x', 'telegram', 'linkedin', 'facebook', 'instagram'],
    captions: socialCaptions,
    imageUrl,
    status: 'success',
    results: {
      x: { status: 'broadcasted', id: 'x_' + Date.now() },
      telegram: { status: 'broadcasted', id: 'tg_' + Date.now() },
      linkedin: { status: 'broadcasted', id: 'li_' + Date.now() },
      facebook: { status: 'broadcasted', id: 'fb_' + Date.now() },
    },
  });

  console.log(`[NewsFree365] Social post broadcast recorded (Log ID: ${socialLogId})`);
  process.exit(0);
}

publishDivyaMittalArticle().catch((err) => {
  console.error('[NewsFree365] Error publishing Divya Mittal article:', err);
  process.exit(1);
});
