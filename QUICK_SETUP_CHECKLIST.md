# Quick Action Checklist - PolicyDrift News SEO Setup

## ✅ COMPLETED

### 1. Website Configuration
- ✅ Updated all URLs to https://www.policydrift.live
- ✅ Configured robots.txt with proper directives
- ✅ Added comprehensive meta tags (Open Graph, Twitter Cards)
- ✅ Implemented JSON-LD structured data
- ✅ Created dynamic sitemap generator
- ✅ Added Google AdSense script (ca-pub-1508845535613236)
- ✅ Implemented Core Web Vitals monitoring
- ✅ Added accessibility improvements (skip links, ARIA labels)
- ✅ Created OptimizedImage component with lazy loading

### 2. Google Tag Manager
- ✅ GTM Container ID: **GTM-PL5K2HKZ** installed in index.html
- ✅ GTM head script added
- ✅ GTM noscript fallback added for non-JS browsers

---

## 🔄 NEXT STEPS (Follow in Order)

### STEP 1: Deploy to Production (5 minutes)
```bash
cd /Users/raunak/projects/news-website
vercel --prod
```
OR
- Push to main branch on GitHub
- Vercel will auto-deploy

**Verify deployment:**
- Visit https://www.policydrift.live
- Check if GTM is loading (use browser DevTools → Network tab → filter "gtm")

---

### STEP 2: Verify GTM Installation (5 minutes)

1. **Install Tag Assistant Extension**
   - Chrome: https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk
   - Edge: https://microsoftedge.microsoft.com/addons/detail/tag-assistant-legacy-by/pdpfbpmnjkdflpjieobgmmhngndkpdan

2. **Test GTM on Your Site**
   - Visit https://www.policydrift.live
   - Click Tag Assistant extension icon
   - You should see: "Google Tag Manager (GTM-PL5K2HKZ)" with green checkmark
   - If red/yellow: click for details and fix issues

3. **Use GTM Preview Mode**
   - Go to https://tagmanager.google.com/
   - Open your container (GTM-PL5K2HKZ)
   - Click **Preview** button (top right)
   - Enter: https://www.policydrift.live
   - A debugger window will open showing which tags fire

---

### STEP 3: Setup Google Analytics 4 (15 minutes)

1. **Create GA4 Property**
   - Go to https://analytics.google.com/
   - Click **Admin** (gear icon, bottom left)
   - Under Property column, click **Create Property**
   - Property name: `PolicyDrift News`
   - Timezone: Select your timezone
   - Currency: Select your currency
   - Click **Next**

2. **Create Web Data Stream**
   - Business category: News & Publishing
   - Business size: Select appropriate
   - Click **Create**
   - Platform: **Web**
   - Website URL: `https://www.policydrift.live`
   - Stream name: `PolicyDrift News Web`
   - Enhanced measurement: ✅ Enable all
   - Click **Create Stream**

3. **Copy Measurement ID**
   - You'll see a Measurement ID like: `G-XXXXXXXXXX`
   - **COPY THIS ID** - you'll need it next

4. **Add GA4 to GTM**
   - Go to https://tagmanager.google.com/
   - Open GTM-PL5K2HKZ container
   - Click **Tags** → **New**
   - Click **Tag Configuration**
   - Choose **Google Analytics: GA4 Configuration**
   - Measurement ID: Paste your `G-XXXXXXXXXX`
   - Click **Triggering**
   - Select **All Pages**
   - Name: `GA4 - Configuration`
   - Click **Save**

5. **Publish GTM Container**
   - Click **Submit** (top right)
   - Version name: `GA4 Setup`
   - Description: `Added GA4 configuration tag`
   - Click **Publish**

6. **Test GA4 is Working**
   - Visit https://www.policydrift.live in incognito/private window
   - Go to GA4 → Reports → Realtime
   - You should see yourself as 1 active user within 30 seconds
   - Navigate to different pages, you should see page views

---

### STEP 4: Setup Event Tracking (20 minutes)

#### A. Track Article Views

1. **In GTM, create Variable**
   - Variables → New
   - Variable Configuration: **Data Layer Variable**
   - Data Layer Variable Name: `articleTitle`
   - Name: `DLV - Article Title`
   - Save

2. **Create Article View Tag**
   - Tags → New
   - Tag Configuration: **Google Analytics: GA4 Event**
   - Configuration Tag: Select `GA4 - Configuration`
   - Event Name: `view_article`
   - Event Parameters → Add Row:
     - Parameter Name: `article_title`
     - Value: `{{DLV - Article Title}}`
   - Triggering → New Trigger
   - Trigger Configuration: **Custom Event**
   - Event Name: `article_view`
   - Name: `CE - Article View`
   - Save trigger
   - Name tag: `GA4 - Article View`
   - Save

#### B. Add Tracking to ArticleDetail.jsx

Open `/src/pages/ArticleDetail.jsx` and add this code after the article is loaded:

```javascript
// Add this import at the top
import { useEffect } from 'react';

// Add this inside the component, after article is loaded
useEffect(() => {
  if (article) {
    // Push to dataLayer for GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'article_view',
      articleTitle: article.title,
      articleCategory: article.categories?.name || 'Uncategorized',
      articleAuthor: article.profiles?.username || 'Unknown',
      articleId: article.id
    });
  }
}, [article]);
```

---

### STEP 5: Google Search Console (15 minutes)

1. **Add Property**
   - Go to https://search.google.com/search-console
   - Click **Add Property**
   - Choose **URL prefix**
   - Enter: `https://www.policydrift.live`
   - Click **Continue**

2. **Verify Ownership - Method 1: HTML Tag (Easiest)**
   - Copy the verification meta tag
   - Open `/Users/raunak/projects/news-website/index.html`
   - Add in `<head>` section after existing meta tags:
   ```html
   <meta name="google-site-verification" content="YOUR_CODE_HERE" />
   ```
   - Commit and deploy to production
   - Go back to Search Console
   - Click **Verify**

3. **Verify Ownership - Method 2: GTM (Alternative)**
   - In Search Console, select **Google Tag Manager** verification method
   - Your GTM container GTM-PL5K2HKZ is already installed
   - Click **Verify**
   - Should verify immediately!

4. **Submit Sitemaps**
   - In Search Console, click **Sitemaps** (left menu)
   - Add new sitemap: `sitemap.xml`
   - Click **Submit**
   - Add another: `rss`
   - Click **Submit**
   - Status should show "Success" within minutes

5. **Request Indexing**
   - Click **URL Inspection** (left menu)
   - Enter: `https://www.policydrift.live`
   - Click **Request Indexing**
   - Repeat for important pages:
     - https://www.policydrift.live/about
     - https://www.policydrift.live/contact
     - Your top 5-10 articles

---

### STEP 6: Link GA4 with Search Console (5 minutes)

1. **In GA4**
   - Go to **Admin** → **Property Settings**
   - Click **Product Links** → **Search Console Links**
   - Click **Link**
   - Select your Search Console property
   - Choose web stream: PolicyDrift News Web
   - Click **Next** → **Submit**

2. **Verify Link**
   - Wait 24-48 hours
   - Go to GA4 → Reports → Acquisition → Search Console
   - You should see search query data

---

### STEP 7: Final Verification Checklist

#### Test These URLs:
- [ ] https://www.policydrift.live/ - Homepage loads
- [ ] https://www.policydrift.live/robots.txt - Shows robots.txt
- [ ] https://www.policydrift.live/sitemap.xml - Downloads sitemap (might show in browser)
- [ ] https://www.policydrift.live/rss - Shows RSS feed

#### Test GTM:
- [ ] Open https://www.policydrift.live
- [ ] Open DevTools (F12) → Network tab
- [ ] Filter by "gtm"
- [ ] Reload page
- [ ] You should see "gtm.js" file loaded with status 200

#### Test GA4:
- [ ] Visit site in incognito window
- [ ] Check GA4 Realtime report
- [ ] Should see 1 user within 30 seconds
- [ ] Navigate to 2-3 pages
- [ ] Should see page views updating

#### Test Structured Data:
- [ ] Go to https://search.google.com/test/rich-results
- [ ] Enter: https://www.policydrift.live
- [ ] Click **Test URL**
- [ ] Should show: ✅ Valid structured data (WebSite, Organization)
- [ ] Test an article page too

#### Test Mobile:
- [ ] Open https://developers.google.com/speed/pagespeed/insights/
- [ ] Enter: https://www.policydrift.live
- [ ] Click **Analyze**
- [ ] Should score: Mobile 70+, Desktop 85+
- [ ] Check Core Web Vitals: All green

---

## 📊 MONITORING (After Setup)

### Daily (First Week)
- Check Search Console for errors
- Monitor GA4 Realtime for traffic
- Check GTM debugger if needed

### Weekly
- Review GA4 Acquisition reports
- Check Search Console Performance
- Monitor Core Web Vitals
- Review AdSense earnings

### Monthly
- Analyze top-performing articles
- Review bounce rates
- Check search queries in Search Console
- Optimize low-performing pages

---

## 🆘 TROUBLESHOOTING

### GTM Not Loading?
1. Check browser console for errors (F12 → Console)
2. Verify GTM-PL5K2HKZ is in index.html
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check if ad blocker is blocking GTM
5. Use GTM Preview mode to debug

### GA4 Not Showing Data?
1. Wait 24-48 hours for initial data
2. Check if GA4 tag fires in GTM Preview
3. Verify Measurement ID is correct
4. Check if you're in correct GA4 property
5. Use Realtime report (shows immediate data)

### Search Console Not Verifying?
1. Ensure meta tag is in `<head>` section
2. Deploy to production (not dev)
3. Wait 5-10 minutes after deployment
4. Try GTM verification method instead
5. Check robots.txt doesn't block Google

### Sitemap Not Appearing?
1. Visit https://www.policydrift.live/sitemap.xml directly
2. Check console for errors
3. Ensure articles are published in database
4. Check Supabase connection
5. Regenerate sitemap using the download button

---

## 📞 SUPPORT RESOURCES

- **GTM Help**: https://support.google.com/tagmanager
- **GA4 Help**: https://support.google.com/analytics
- **Search Console Help**: https://support.google.com/webmasters
- **AdSense Help**: https://support.google.com/adsense
- **This Project Docs**: 
  - GTM_SETUP_GUIDE.md
  - ADSENSE_COMPLIANCE.md
  - SEO_SUMMARY.md

---

## 🎯 SUCCESS METRICS (30 Days)

Track these KPIs:
- [ ] Google Search impressions: Target 1,000+
- [ ] Organic clicks: Target 100+
- [ ] Average position: Target < 50
- [ ] Pages indexed: Target 80%+ of published articles
- [ ] Core Web Vitals: All "Good" (green)
- [ ] AdSense RPM: Monitor and optimize
- [ ] Bounce rate: Target < 60%

---

**Created**: October 14, 2025  
**GTM Container**: GTM-PL5K2HKZ  
**Website**: https://www.policydrift.live  
**AdSense**: ca-pub-1508845535613236
