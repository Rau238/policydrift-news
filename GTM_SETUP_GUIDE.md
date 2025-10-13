# Google Tag Manager & Analytics Setup Guide

## Overview
This guide provides step-by-step instructions for setting up Google Tag Manager (GTM) and Google Analytics 4 (GA4) for PolicyDrift News website.

## Part 1: Google Tag Manager Setup

### Step 1: Create GTM Account
1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Click **"Create Account"**
3. Fill in account details:
   - **Account Name**: PolicyDrift News
   - **Country**: Your country
   - Click **Continue**

### Step 2: Setup Container
1. Container setup:
   - **Container Name**: www.policydrift.live
   - **Target Platform**: Web
   - Click **Create**
2. Accept Terms of Service
3. You'll get a GTM Container ID (format: **GTM-XXXXXXX**)

### Step 3: Install GTM Code
The GTM code has been added to `index.html` with your Container ID: **GTM-PL5K2HKZ**

**In the `<head>` section** (✅ Already installed):
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PL5K2HKZ');</script>
<!-- End Google Tag Manager -->
```

**In the `<body>` section** (✅ Already installed):
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PL5K2HKZ"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### Step 4: Verify GTM Installation
1. Install [Google Tag Assistant Chrome Extension](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Visit your website: https://www.policydrift.live
3. Click the Tag Assistant icon
4. You should see your GTM container listed

## Part 2: Google Analytics 4 Setup

### Step 1: Create GA4 Property
1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon at bottom left)
3. Click **Create Property**
4. Fill in property details:
   - **Property Name**: PolicyDrift News
   - **Reporting Time Zone**: Your timezone
   - **Currency**: Your currency
   - Click **Next**

### Step 2: Setup Data Stream
1. Select platform: **Web**
2. Fill in stream details:
   - **Website URL**: https://www.policydrift.live
   - **Stream Name**: PolicyDrift News Web
   - Click **Create Stream**
3. Copy your **Measurement ID** (format: **G-XXXXXXXXXX**)

### Step 3: Configure GA4 in GTM

#### Option A: Using GTM (Recommended)
1. In GTM, go to **Tags** → **New**
2. Click **Tag Configuration**
3. Choose **Google Analytics: GA4 Configuration**
4. Enter your **Measurement ID** (G-XXXXXXXXXX)
5. Click **Triggering**
6. Select **All Pages**
7. Name the tag: "GA4 - Configuration"
8. Click **Save**

#### Option B: Direct Installation (Alternative)
If you prefer direct installation, update `index.html`:
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Step 4: Setup Event Tracking in GTM

#### Track Article Views
1. In GTM, go to **Variables** → **New**
2. Create a **Data Layer Variable**:
   - Name: "Article Title"
   - Data Layer Variable Name: `articleTitle`
   - Save

3. Go to **Tags** → **New**
4. Tag Configuration: **Google Analytics: GA4 Event**
5. Configuration:
   - **Measurement ID**: Your G-XXXXXXXXXX
   - **Event Name**: `view_article`
   - **Event Parameters**:
     - Parameter Name: `article_title`
     - Value: `{{Article Title}}`
6. Triggering: Create a custom trigger
   - Trigger Type: **Custom Event**
   - Event Name: `article_view`
7. Save as "GA4 - Article View Event"

#### Track Newsletter Signups
1. Create new tag: **Google Analytics: GA4 Event**
2. Configuration:
   - **Event Name**: `newsletter_signup`
3. Trigger: **Custom Event** → `newsletter_signup`
4. Save

#### Track Social Shares
1. Create new tag: **Google Analytics: GA4 Event**
2. Configuration:
   - **Event Name**: `social_share`
   - **Event Parameters**:
     - `platform`: `{{Click Text}}`
3. Trigger: All clicks on social share buttons
4. Save

### Step 5: Implement Tracking in Code

Add this to your `ArticleDetail.jsx` component:

```javascript
useEffect(() => {
  if (article) {
    // Push article view to dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'article_view',
      articleTitle: article.title,
      articleCategory: article.categories?.name,
      articleAuthor: article.profiles?.username,
      articleId: article.id
    });
  }
}, [article]);
```

Add this to `Newsletter.jsx` for signup tracking:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  // ... your existing code ...
  
  // Track newsletter signup
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'newsletter_signup',
    email: email
  });
};
```

Add this to `SocialShare.jsx` for share tracking:

```javascript
const handleShare = (platform) => {
  // ... your existing share logic ...
  
  // Track social share
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'social_share',
    platform: platform,
    articleTitle: title,
    articleUrl: url
  });
};
```

### Step 6: Publish GTM Container
1. In GTM, click **Submit** (top right)
2. Add Version Name: "Initial Setup"
3. Add Description: "GA4 configuration and basic event tracking"
4. Click **Publish**

## Part 3: Google Search Console Setup

### Step 1: Add Property
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **Add Property**
3. Choose **URL prefix**: `https://www.policydrift.live`
4. Click **Continue**

### Step 2: Verify Ownership

#### Method 1: HTML Tag (Recommended)
1. Copy the verification meta tag
2. Add to `index.html` in the `<head>` section:
```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```
3. Deploy to Vercel
4. Click **Verify** in Search Console

#### Method 2: HTML File
1. Download the verification file
2. Place it in the `public/` folder
3. Deploy to Vercel
4. Click **Verify** in Search Console

### Step 3: Submit Sitemap
1. In Search Console, go to **Sitemaps** (left menu)
2. Enter: `https://www.policydrift.live/sitemap.xml`
3. Click **Submit**
4. Also submit RSS: `https://www.policydrift.live/rss`

### Step 4: Link GA4 and Search Console
1. In GA4, go to **Admin** → **Property Settings**
2. Click **Product Links** → **Search Console Links**
3. Click **Link** and select your Search Console property
4. Confirm linking

## Part 4: Testing & Verification

### Test GTM Installation
1. In GTM, click **Preview** (top right)
2. Enter your website URL
3. Test all triggers and tags fire correctly

### Test GA4 Events
1. In GA4, go to **Reports** → **Realtime**
2. Visit your website in another tab
3. Navigate through pages
4. Check if events appear in Realtime report

### Test Conversions
1. In GA4, go to **Configure** → **Events**
2. Mark important events as conversions:
   - `newsletter_signup`
   - `view_article`
3. Monitor conversion data

## Part 5: Important Configuration

### Enable Enhanced Measurement (GA4)
1. In GA4, go to **Admin** → **Data Streams**
2. Click your web stream
3. Click **Enhanced Measurement**
4. Enable:
   - ✅ Page views
   - ✅ Scrolls
   - ✅ Outbound clicks
   - ✅ Site search
   - ✅ Video engagement
   - ✅ File downloads

### Setup Custom Dimensions (GA4)
1. Go to **Admin** → **Custom Definitions**
2. Click **Create custom dimension**
3. Create dimensions for:
   - **Article Category**: `article_category`
   - **Article Author**: `article_author`
   - **User Type**: `user_type` (logged in/out)

### Data Retention Settings
1. Go to **Admin** → **Data Settings** → **Data Retention**
2. Set to **14 months** (maximum for free)
3. Enable **Reset on new activity**

## Part 6: Privacy & GDPR Compliance

### Cookie Consent Banner
You need to implement a cookie consent banner. Install a library:

```bash
npm install react-cookie-consent
```

Add to `App.jsx`:
```javascript
import CookieConsent from "react-cookie-consent";

// Inside your App component
<CookieConsent
  location="bottom"
  buttonText="Accept"
  declineButtonText="Decline"
  enableDeclineButton
  cookieName="policydrift_cookie_consent"
  style={{ background: "#2B373B" }}
  buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
  expires={150}
  onAccept={() => {
    // Enable GTM/GA4
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'cookie_consent_granted'
    });
  }}
>
  We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{" "}
  <Link to="/privacy-policy" style={{ color: "#fff", textDecoration: "underline" }}>
    Privacy Policy
  </Link>
</CookieConsent>
```

### Update Privacy Policy
Ensure your Privacy Policy discloses:
- Google Analytics data collection
- Cookie usage
- Third-party services (AdSense, GA4, GTM)
- User rights (access, deletion)
- Contact information

## Part 7: Monitoring & Optimization

### Daily Checks
- [ ] Check GTM container for errors
- [ ] Monitor GA4 Realtime report
- [ ] Review Search Console for issues

### Weekly Checks
- [ ] Review top pages in GA4
- [ ] Check conversion rates
- [ ] Monitor bounce rate
- [ ] Review Search Console queries

### Monthly Checks
- [ ] Analyze traffic trends
- [ ] Review event tracking accuracy
- [ ] Update custom dimensions if needed
- [ ] Optimize underperforming pages

## Useful Resources

- [GTM Documentation](https://support.google.com/tagmanager)
- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [Search Console Help](https://support.google.com/webmasters)
- [GTM Tutorial Videos](https://www.youtube.com/c/MeasureSchool)
- [GA4 Tutorial](https://www.youtube.com/c/AnalyticsMania)

## Quick Reference

### Your IDs
- **GTM Container ID**: GTM-PL5K2HKZ ✅ (Installed)
- **GA4 Measurement ID**: G-XXXXXXXXXX (Get this from GA4)
- **AdSense Publisher ID**: ca-pub-1508845535613236 ✅
- **Website URL**: https://www.policydrift.live ✅

### Important URLs
- **GTM Dashboard**: https://tagmanager.google.com/
- **GA4 Dashboard**: https://analytics.google.com/
- **Search Console**: https://search.google.com/search-console
- **AdSense Dashboard**: https://adsense.google.com/

---

**Last Updated**: October 14, 2025  
**Version**: 1.0  
**Contact**: support@policydrift.live
