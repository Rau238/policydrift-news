import express from 'express';
import { env } from '../config/env.js';

const router = express.Router();

function isAuthenticated(req) {
  const secret = (env.ADMIN_SECRET || process.env.INSIGHTS_ADMIN_SECRET || 'Raunak@123').trim();
  const header = req.headers['x-admin-secret'];
  const bearer = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
  const cookieHeader = req.headers.cookie || '';
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)pd_admin=([^;]+)/);
  const cookieVal = cookieMatch ? decodeURIComponent(cookieMatch[1]).trim() : '';
  const querySecret = (req.query?.secret || req.query?.admin_secret || req.query?.key || '').toString().trim();

  const token = header || bearer || cookieVal || querySecret;
  return token && token === secret;
}

// Authentication gate: show clean Light Mode Access Key prompt if unauthenticated
router.use((req, res, next) => {
  if (isAuthenticated(req)) {
    // If authenticated via query param, set cookie for smooth browsing
    const querySecret = (req.query?.secret || req.query?.admin_secret || req.query?.key || '').toString().trim();
    if (querySecret) {
      const isProd = env.NODE_ENV === 'production';
      res.cookie('pd_admin', querySecret, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      });
    }
    return next();
  }

  // If requesting raw JSON spec, return 401
  if (req.path === '/openapi.json' || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({
      error: 'Unauthorized',
      hint: 'Admin authentication required.',
    });
  }

  // Render a clean, Light Mode Access Key Unlock Screen
  const loginHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Access Required • NewsFree365 API</title>
  <link rel="icon" type="image/svg+xml" href="https://newsfree365.live/icon.svg" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #f8fafc;
      color: #0f172a;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .auth-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
      border-radius: 16px;
      width: 100%;
      max-width: 420px;
      padding: 36px 32px;
      text-align: center;
    }
    .icon-box {
      width: 52px;
      height: 52px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      color: #2563eb;
    }
    h1 {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
    }
    p {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .input-group {
      margin-bottom: 20px;
      text-align: left;
    }
    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 6px;
    }
    input {
      width: 100%;
      padding: 12px 14px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 14px;
      color: #0f172a;
      font-family: inherit;
      outline: none;
      transition: all 0.15s ease;
    }
    input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }
    .btn {
      width: 100%;
      padding: 12px 16px;
      background: #2563eb;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.15s ease;
    }
    .btn:hover {
      background: #1d4ed8;
    }
    .error-msg {
      display: none;
      background: #fff1f2;
      border: 1px solid #fecdd3;
      color: #e11d48;
      font-size: 12px;
      font-weight: 600;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="auth-card">
    <div class="icon-box">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    </div>
    <h1>Admin API Documentation</h1>
    <p>This API portal is restricted. Enter your Admin Secret Access Key to proceed.</p>

    <div id="errorMsg" class="error-msg">Invalid access key. Please try again.</div>

    <form onsubmit="handleAuth(event)">
      <div class="input-group">
        <label for="accessKey">Admin Secret Key</label>
        <input type="password" id="accessKey" placeholder="Enter your secret key" autofocus required autocomplete="current-password" />
      </div>
      <button type="submit" class="btn">
        <span>Unlock API Portal</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
      </button>
    </form>
  </div>

  <script>
    async function handleAuth(e) {
      e.preventDefault();
      const secret = document.getElementById('accessKey').value.trim();
      const errorMsg = document.getElementById('errorMsg');
      errorMsg.style.display = 'none';

      if (!secret) return;

      try {
        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret })
        });

        if (res.ok) {
          // Success: Cookie is set, reload page to open docs
          window.location.reload();
        } else {
          errorMsg.textContent = 'Invalid Access Key. Please try again.';
          errorMsg.style.display = 'block';
        }
      } catch (err) {
        errorMsg.textContent = 'Network error. Please try again.';
        errorMsg.style.display = 'block';
      }
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(401).send(loginHtml);
});

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'NewsFree365 / PolicyDrift Full API Reference',
    version: '2.0.0',
    description: `
## NewsFree365 High-Performance Intelligence & Automation API

Interactive API documentation and real-time execution testing sandbox for all endpoints across the NewsFree365 engine:
- **Public News Engine**: Discover latest stories, search, algorithmic trending, and visual stories.
- **Live Sports Hubs**: Real-time Cricbuzz cricket scores, commentary, scorecards, and football fixtures.
- **Interactive Readers Tools**: Daily News Intelligence Quiz, Community Opinion Polls, and Macroeconomic Calendars.
- **Publishing & Distribution**: Web Push notifications, Email Newsletter digests, and Automated Multi-Channel Social Sharing.
- **Editorial & Ingest Automation**: Dynamic RSS crawler, AI content enrichment, image uploading, and ranking score computation.
- **System Diagnostics**: Real-time database metrics, table storage footprint analysis, and worker lifecycle status.

---

### Authentication
Protected endpoints require the administrative secret key via one of the following methods:
1. **HTTP Header**: \`x-admin-secret: <SECRET>\`
2. **Bearer Token**: \`Authorization: Bearer <SECRET>\`
3. **Session Cookie**: \`pd_admin=<SECRET>\`
4. **Query String**: \`?secret=<SECRET>\`
    `,
    contact: {
      name: 'NewsFree365 API Support',
      url: 'https://newsfree365.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:4050',
      description: 'Local Production/Dev API Server (Port 4050)',
    },
    {
      url: 'http://localhost:3050',
      description: 'Frontend Web Server Proxy (Port 3050)',
    },
  ],
  tags: [
    { name: 'System & Health', description: 'System health check, storage analytics, and runtime metrics' },
    { name: 'News & Discovery', description: 'Public news discovery, categories, trending feeds, and full stories' },
    { name: 'Financial Markets', description: 'Real-time stock indices, currencies, commodities, and bond yields' },
    { name: 'Live Cricket Hub', description: 'Real-time Cricbuzz cricket live scores, scorecard, and series' },
    { name: 'Live Football Hub', description: 'Real-time football fixtures, live match scores, and leagues' },
    { name: 'Macroeconomic Calendar', description: 'Central bank rate decisions, earnings, IPOs, holidays, and dividends' },
    { name: 'Daily News Quiz', description: 'Curated daily intelligence quiz questions, voting, and answer checks' },
    { name: 'Community Polls', description: 'Public opinion polls, instant option voting, and voter deduplication' },
    { name: 'Web Push Alerts', description: 'Browser push notification subscription registry and broadcasting' },
    { name: 'Email Newsletter', description: 'Subscriber enrollment, automated 10 AM dispatch, and broadcast' },
    { name: 'Social Media Automation', description: 'Multi-platform social distribution (Twitter/X, LinkedIn, Telegram)' },
    { name: 'Admin Editorial & Articles', description: 'Article CRUD, review queue approval, breaking toggles, and image upload' },
    { name: 'Admin RSS & Feeds', description: 'Feed source catalogue management, validation, and on-demand ingest' },
    { name: 'Admin Automation Workers', description: 'Algorithmic ranking recalculation, metrics aggregation, and scheduling' },
    { name: 'SEO & Sitemaps', description: 'Google News sitemaps, slug feeds, and Google Trends discovery' },
  ],
  components: {
    securitySchemes: {
      AdminSecretHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'x-admin-secret',
        description: 'Provide admin key via HTTP header (x-admin-secret)',
      },
      AdminBearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'Provide admin key via Bearer token',
      },
      AdminCookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'pd_admin',
        description: 'Provide admin key via session cookie',
      },
    },
    schemas: {
      // 1. Health & Diagnostics
      HealthResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
          service: { type: 'string', example: 'newsfree365-api' },
        },
      },
      AdminHealthCheckResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
          status: { type: 'string', example: 'healthy' },
          timestamp: { type: 'string', format: 'date-time', example: '2026-09-17T12:35:04.802Z' },
          responseTimeMs: { type: 'number', example: 78 },
          system: {
            type: 'object',
            properties: {
              uptimeSeconds: { type: 'number', example: 86 },
              uptimeFormatted: { type: 'string', example: '0h 1m 26s' },
              environment: { type: 'string', example: 'production' },
              nodeVersion: { type: 'string', example: 'v22.12.0' },
              platform: { type: 'string', example: 'win32' },
              arch: { type: 'string', example: 'x64' },
              pid: { type: 'number', example: 26832 },
              memory: {
                type: 'object',
                properties: {
                  rssMb: { type: 'number', example: 105.43 },
                  heapUsedMb: { type: 'number', example: 50.59 },
                  heapTotalMb: { type: 'number', example: 56.41 },
                  externalMb: { type: 'number', example: 4.41 },
                },
              },
            },
          },
          database: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'connected' },
              pingLatencyMs: { type: 'number', example: 0 },
              host: { type: 'string', example: '127.0.0.1' },
              port: { type: 'number', example: 3306 },
              database: { type: 'string', example: 'policydrift_news' },
              poolLimit: { type: 'number', example: 10 },
              totalPosts: { type: 'number', example: 197595 },
              published24h: { type: 'number', example: 13367 },
              activeSourcesCount: { type: 'number', example: 188 },
              storage: {
                type: 'object',
                properties: {
                  usedMb: { type: 'number', example: 1019.61 },
                  dataFreeMb: { type: 'number', example: 8 },
                  tableCount: { type: 'number', example: 16 },
                },
              },
            },
          },
          services: {
            type: 'object',
            properties: {
              rssWorker: {
                type: 'object',
                properties: {
                  workerEnabled: { type: 'boolean', example: true },
                  cronEnabled: { type: 'boolean', example: true },
                  configuredFeedsCount: { type: 'number', example: 185 },
                  lastIngestedPost: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 316499 },
                      title: { type: 'string', example: 'Sidus Space Signs MOU with 3GM Plus' },
                      slug: { type: 'string', example: 'sidus-space-signs-mou' },
                      publishedAt: { type: 'string', format: 'date-time' },
                      createdAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
              trends: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean', example: true },
                  geo: { type: 'string', example: 'IN' },
                  cron: { type: 'string', example: '*/30 * * * *' },
                },
              },
              pushNotifications: {
                type: 'object',
                properties: {
                  vapidConfigured: { type: 'boolean', example: false },
                  activeSubscribers: { type: 'number', example: 0 },
                },
              },
              newsletter: {
                type: 'object',
                properties: {
                  smtpConfigured: { type: 'boolean', example: true },
                  activeSubscribers: { type: 'number', example: 0 },
                },
              },
            },
          },
        },
      },
      AdminStatsResponse: {
        type: 'object',
        properties: {
          totalPosts: { type: 'integer', example: 197595 },
          publishedPosts: { type: 'integer', example: 197537 },
          pendingPosts: { type: 'integer', example: 58 },
          draftPosts: { type: 'integer', example: 0 },
          totalSources: { type: 'integer', example: 188 },
          activeSources: { type: 'integer', example: 185 },
          totalViews: { type: 'integer', example: 450230 },
          todayPosts: { type: 'integer', example: 13367 },
          categoriesCount: { type: 'integer', example: 14 },
        },
      },

      // 2. News Articles
      Post: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 316499 },
          slug: { type: 'string', example: 'sidus-space-signs-mou' },
          title: { type: 'string', example: 'Sidus Space Signs Memorandum of Understanding with 3GM Plus' },
          excerpt: { type: 'string', example: 'Comprehensive summary of satellite collaboration accord...' },
          key_takeaways: {
            type: 'array',
            items: { type: 'string' },
            example: ['Key strategic aerospace alliance', 'Focus on small satellite development'],
          },
          body: { type: 'string', example: '<p>Full editorial HTML body content...</p>' },
          image_url: { type: 'string', example: 'https://images.unsplash.com/photo-1518770660439-4636190af475' },
          category: { type: 'string', example: 'Science' },
          view_count: { type: 'integer', example: 140 },
          published_at: { type: 'string', format: 'date-time', example: '2026-09-17T12:31:00.000Z' },
          created_at: { type: 'string', format: 'date-time', example: '2026-09-17T12:35:02.000Z' },
          source_feed: { type: 'string', example: 'https://news.google.com/rss' },
          post_kind: { type: 'string', enum: ['standard', 'visual_story', 'curated', 'breaking'], example: 'standard' },
          is_breaking: { type: 'integer', example: 0 },
          is_featured: { type: 'integer', example: 0 },
          editorial_priority: { type: 'string', example: 'normal' },
          like_count: { type: 'integer', example: 12 },
          share_count: { type: 'integer', example: 4 },
          reading_time_minutes: { type: 'integer', example: 2 },
          original_url: { type: 'string', example: 'https://news.google.com/rss/articles/...' },
        },
      },
      PostsListResponse: {
        type: 'object',
        properties: {
          posts: { type: 'array', items: { $ref: '#/components/schemas/Post' } },
          total: { type: 'integer', example: 197595 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          totalPages: { type: 'integer', example: 9880 },
        },
      },

      // 3. Market Quotes
      QuoteItem: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
          id: { type: 'string', example: 'nsei' },
          label: { type: 'string', example: 'Nifty 50' },
          group: { type: 'string', example: 'India' },
          country: { type: 'string', example: 'India' },
          symbol: { type: 'string', example: '^NSEI' },
          shortName: { type: 'string', example: 'NIFTY 50' },
          currency: { type: 'string', example: 'INR' },
          price: { type: 'number', example: 23270.6 },
          previousClose: { type: 'number', example: 23217.6 },
          change: { type: 'number', example: 53.0 },
          changePercent: { type: 'number', example: 0.228 },
          asOf: { type: 'string', format: 'date-time' },
        },
      },
      MarketQuotesResponse: {
        type: 'object',
        properties: {
          quotes: { type: 'array', items: { $ref: '#/components/schemas/QuoteItem' } },
          fetchedAt: { type: 'string', format: 'date-time' },
        },
      },

      // 4. Sports, Calendar & Quizzes
      CalendarEvent: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'evt-ec-rbi-mpc-2026' },
          type: { type: 'string', enum: ['economy', 'holiday', 'result', 'ipo', 'dividend', 'commodity'], example: 'economy' },
          title: { type: 'string', example: 'RBI Monetary Policy Committee Rate Decision' },
          country: { type: 'string', example: 'IN' },
          countryName: { type: 'string', example: 'India' },
          date: { type: 'string', format: 'date', example: '2026-10-08' },
          time: { type: 'string', example: '10:00 AM IST' },
          impact: { type: 'string', enum: ['high', 'medium', 'low'], example: 'high' },
          forecast: { type: 'string', example: '6.25%' },
          previous: { type: 'string', example: '6.50%' },
          actual: { type: 'string', nullable: true },
        },
      },
      QuizQuestion: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          editionDate: { type: 'string', format: 'date', example: '2026-09-17' },
          category: { type: 'string', example: 'World Policy & Geopolitics' },
          categorySlug: { type: 'string', example: 'world-news' },
          question: { type: 'string', example: 'Which global treaty standardizes cross-border digital economy regulations?' },
          options: { type: 'array', items: { type: 'string' }, example: ['DEPA', 'Kyoto Protocol', 'Bretton Woods', 'Maritime Border Treaty'] },
          correctIndex: { type: 'integer', example: 0 },
          explanation: { type: 'string', example: 'DEPA pioneers digital trade rules, data flow safeguards, and AI governance standards.' },
          audienceVotes: { type: 'array', items: { type: 'integer' }, example: [74, 11, 9, 6] },
          keyTerm: { type: 'string', example: 'DEPA Digital Trade' },
        },
      },
      Poll: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          question: { type: 'string', example: 'Should global central banks accelerate interest rate cuts to safeguard growth?' },
          category: { type: 'string', example: 'Economy' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'opt_1' },
                text: { type: 'string', example: 'Yes, strong stimulus is essential' },
                votes: { type: 'integer', example: 142 },
              },
            },
          },
          total_votes: { type: 'integer', example: 265 },
          is_active: { type: 'integer', example: 1 },
        },
      },
      Source: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Reuters Business News' },
          source_type: { type: 'string', example: 'rss' },
          url: { type: 'string', example: 'https://news.google.com/rss' },
          category: { type: 'string', example: 'Markets' },
          country: { type: 'string', example: 'GLOBAL' },
          language: { type: 'string', example: 'en' },
          is_active: { type: 'integer', example: 1 },
          fetch_interval_minutes: { type: 'integer', example: 15 },
          trust_score: { type: 'integer', example: 95 },
          articles_imported: { type: 'integer', example: 4320 },
        },
      },
    },
  },
  paths: {
    // ── SYSTEM & HEALTH ──────────────────────────────────────────────────────
    '/health': {
      get: {
        tags: ['System & Health'],
        summary: 'Public Health Check Ping',
        description: 'Returns status 200 and basic runtime identifier.',
        responses: {
          200: {
            description: 'API is running normally',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthResponse' } } },
          },
        },
      },
    },
    '/api/admin/health': {
      get: {
        tags: ['System & Health'],
        summary: 'Protected Diagnostic Health & Storage Monitor',
        description: 'Deep health check: MySQL latency, total post counts, 24h publishing volume, table storage in MB, and worker statuses.',
        security: [{ AdminSecretHeader: [] }, { AdminBearerAuth: [] }, { AdminCookieAuth: [] }],
        responses: {
          200: {
            description: 'Diagnostic report retrieved successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminHealthCheckResponse' } } },
          },
          401: { description: 'Unauthorized - invalid or missing admin secret' },
        },
      },
    },
    '/api/admin/stats': {
      get: {
        tags: ['System & Health'],
        summary: 'Admin Dashboard Stats Summary',
        description: 'Retrieves article counts by status, source counts, view totals, and publishing stats.',
        security: [{ AdminSecretHeader: [] }, { AdminBearerAuth: [] }, { AdminCookieAuth: [] }],
        responses: {
          200: {
            description: 'Metrics summary',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminStatsResponse' } } },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },

    // ── NEWS & DISCOVERY ─────────────────────────────────────────────────────
    '/api/news/latest': {
      get: {
        tags: ['News & Discovery'],
        summary: 'Fetch Latest Published Articles',
        description: 'Returns latest news stories with optional category filtering and pagination.',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Category filter (e.g. Science, Markets, Politics)' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: 'Articles retrieved',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PostsListResponse' } } },
          },
        },
      },
    },
    '/api/news/trending': {
      get: {
        tags: ['News & Discovery'],
        summary: 'Fetch Algorithmic Trending Articles',
        description: 'Returns top trending stories scored by algorithmic engagement and freshness velocity.',
        parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }],
        responses: {
          200: {
            description: 'Trending stories list',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PostsListResponse' } } },
          },
        },
      },
    },
    '/api/news/popular': {
      get: {
        tags: ['News & Discovery'],
        summary: 'Fetch Most Popular Articles',
        description: 'Returns all-time most viewed stories.',
        parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }],
        responses: {
          200: {
            description: 'Popular stories list',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PostsListResponse' } } },
          },
        },
      },
    },
    '/api/news/{slug}': {
      get: {
        tags: ['News & Discovery'],
        summary: 'Fetch Single Story Details by Slug',
        description: 'Returns full article body, takeaways, and related articles.',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' }, description: 'Article slug identifier' }],
        responses: {
          200: {
            description: 'Story details found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    article: { $ref: '#/components/schemas/Post' },
                    related: { type: 'array', items: { $ref: '#/components/schemas/Post' } },
                  },
                },
              },
            },
          },
          404: { description: 'Article not found' },
        },
      },
    },
    '/api/posts/categories': {
      get: {
        tags: ['News & Discovery'],
        summary: 'List Available News Categories',
        description: 'Returns unique categories with article counts.',
        responses: {
          200: {
            description: 'Categories list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      category: { type: 'string', example: 'Markets' },
                      count: { type: 'integer', example: 1420 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── FINANCIAL MARKETS ────────────────────────────────────────────────────
    '/api/market-quotes': {
      get: {
        tags: ['Financial Markets'],
        summary: 'Real-Time Global Market Quotes',
        description: 'Returns real-time indices (Nifty 50, Sensex, Dow, S&P 500), commodities (Gold, Crude Oil), and Forex rates.',
        responses: {
          200: {
            description: 'Market quotes retrieved',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MarketQuotesResponse' } } },
          },
        },
      },
    },

    // ── LIVE SPORTS HUBS ─────────────────────────────────────────────────────
    '/api/cricket/matches': {
      get: {
        tags: ['Live Cricket Hub'],
        summary: 'Live & Upcoming Cricket Matches',
        description: 'Returns live Cricbuzz match feed with scores, status, and team details.',
        responses: {
          200: {
            description: 'Matches retrieved',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/api/cricket/match/{matchId}/mini': {
      get: {
        tags: ['Live Cricket Hub'],
        summary: 'Live Mini Match Scorecard',
        parameters: [{ name: 'matchId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Scorecard retrieved' } },
      },
    },
    '/api/football/matches': {
      get: {
        tags: ['Live Football Hub'],
        summary: 'Live Football Scores & Fixtures',
        description: 'Returns match fixtures across major global leagues.',
        responses: { 200: { description: 'Matches retrieved' } },
      },
    },

    // ── MACROECONOMIC CALENDAR ───────────────────────────────────────────────
    '/api/calendar/events': {
      get: {
        tags: ['Macroeconomic Calendar'],
        summary: 'List Calendar Events',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['all', 'economy', 'holiday', 'result', 'ipo', 'dividend', 'commodity'] } },
          { name: 'country', in: 'query', schema: { type: 'string', enum: ['all', 'IN', 'US', 'GLOBAL'] } },
          { name: 'impact', in: 'query', schema: { type: 'string', enum: ['all', 'high', 'medium', 'low'] } },
          { name: 'timeframe', in: 'query', schema: { type: 'string', enum: ['all', 'this_week', 'this_month', 'upcoming', 'past'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Calendar events list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    events: { type: 'array', items: { $ref: '#/components/schemas/CalendarEvent' } },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── DAILY QUIZ ───────────────────────────────────────────────────────────
    '/api/quiz/today': {
      get: {
        tags: ['Daily News Quiz'],
        summary: 'Fetch Today\'s Curated Quiz Questions',
        parameters: [{ name: 'date', in: 'query', schema: { type: 'string', format: 'date' } }],
        responses: {
          200: {
            description: 'Quiz questions retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    date: { type: 'string' },
                    questions: { type: 'array', items: { $ref: '#/components/schemas/QuizQuestion' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/admin/quiz': {
      get: {
        tags: ['Daily News Quiz'],
        summary: 'Admin Quiz Management List',
        security: [{ AdminSecretHeader: [] }, { AdminBearerAuth: [] }, { AdminCookieAuth: [] }],
        responses: { 200: { description: 'Admin quiz list' }, 401: { description: 'Unauthorized' } },
      },
      post: {
        tags: ['Daily News Quiz'],
        summary: 'Create New Daily Quiz Question',
        security: [{ AdminSecretHeader: [] }, { AdminBearerAuth: [] }, { AdminCookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['question', 'options', 'correctIndex', 'explanation'],
                properties: {
                  question: { type: 'string', example: 'Which global treaty standardizes cross-border digital economy regulations?' },
                  options: { type: 'array', items: { type: 'string' }, example: ['DEPA', 'Kyoto Accord', 'Bretton Woods'] },
                  correctIndex: { type: 'integer', example: 0 },
                  explanation: { type: 'string', example: 'DEPA establishes modern standards for cross-border data transfer.' },
                  category: { type: 'string', example: 'World Policy & Geopolitics' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Question created' }, 401: { description: 'Unauthorized' } },
      },
    },

    // ── COMMUNITY POLLS ──────────────────────────────────────────────────────
    '/api/polls/active': {
      get: {
        tags: ['Community Polls'],
        summary: 'Fetch Active Daily Opinion Poll',
        responses: {
          200: {
            description: 'Active poll retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { poll: { $ref: '#/components/schemas/Poll' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/polls/{id}/vote': {
      post: {
        tags: ['Community Polls'],
        summary: 'Submit Vote on Poll Option',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['optionId'],
                properties: {
                  optionId: { type: 'string', example: 'opt_1' },
                  voterIdentifier: { type: 'string', example: 'device-fingerprint-uuid' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Vote recorded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    alreadyVoted: { type: 'boolean' },
                    poll: { $ref: '#/components/schemas/Poll' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── WEB PUSH ALERTS ──────────────────────────────────────────────────────
    '/api/push/subscribe': {
      post: {
        tags: ['Web Push Alerts'],
        summary: 'Register Native Browser Push Subscription',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['endpoint', 'keys'],
                properties: {
                  endpoint: { type: 'string' },
                  keys: {
                    type: 'object',
                    required: ['p256dh', 'auth'],
                    properties: { p256dh: { type: 'string' }, auth: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Subscribed' } },
      },
    },

    // ── EMAIL NEWSLETTER ─────────────────────────────────────────────────────
    '/api/newsletter/subscribe': {
      post: {
        tags: ['Email Newsletter'],
        summary: 'Subscribe to Email Newsletter',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'subscriber@domain.com' },
                  name: { type: 'string', example: 'Jordan Lee' },
                  frequency: { type: 'string', enum: ['daily', 'weekly'], default: 'daily' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Subscribed' } },
      },
    },

    // ── ADMIN EDITORIAL & ARTICLES ───────────────────────────────────────────
    '/api/admin/articles': {
      get: {
        tags: ['Admin Editorial & Articles'],
        summary: 'List Articles for Editorial Review',
        security: [{ AdminSecretHeader: [] }, { AdminBearerAuth: [] }, { AdminCookieAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['all', 'published', 'pending', 'draft', 'visual_stories'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        ],
        responses: {
          200: {
            description: 'Articles retrieved',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PostsListResponse' } } },
          },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Admin Editorial & Articles'],
        summary: 'Create New Article or Visual Story',
        security: [{ AdminSecretHeader: [] }, { AdminBearerAuth: [] }, { AdminCookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'body', 'category'],
                properties: {
                  title: { type: 'string', example: 'India Unveils National AI Infrastructure Mission' },
                  excerpt: { type: 'string', example: 'New supercomputing clusters to power domestic AI models.' },
                  body: { type: 'string', example: '<p>Comprehensive policy announcement details...</p>' },
                  category: { type: 'string', example: 'Technology' },
                  image_url: { type: 'string', example: 'https://images.unsplash.com/photo-1518770660439-4636190af475' },
                  key_takeaways: { type: 'array', items: { type: 'string' } },
                  post_kind: { type: 'string', enum: ['standard', 'visual_story', 'breaking'], default: 'standard' },
                  status: { type: 'string', enum: ['published', 'pending', 'draft'], default: 'published' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Article created' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/admin/articles/{id}/publish': {
      post: {
        tags: ['Admin Editorial & Articles'],
        summary: 'Approve & Publish Pending Article',
        security: [{ AdminSecretHeader: [] }, { AdminBearerAuth: [] }, { AdminCookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Article published' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/admin/articles/{id}/breaking': {
      post: {
        tags: ['Admin Editorial & Articles'],
        summary: 'Mark Article as Breaking News',
        security: [{ AdminSecretHeader: [] }, { AdminBearerAuth: [] }, { AdminCookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Marked breaking' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/admin/articles/publish-all-review': {
      post: {
        tags: ['Admin Editorial & Articles'],
        summary: 'Batch Publish All Pending Review Articles',
        security: [{ AdminSecretHeader: [] }, { AdminBearerAuth: [] }, { AdminCookieAuth: [] }],
        responses: { 200: { description: 'All pending articles published' }, 401: { description: 'Unauthorized' } },
      },
    },

    // ── ADMIN RSS & FEEDS ────────────────────────────────────────────────────
    '/api/admin/sources': {
      get: {
        tags: ['Admin RSS & Feeds'],
        summary: 'List Managed Feed Sources',
        security: [{ AdminSecretHeader: [] }, { AdminBearerAuth: [] }, { AdminCookieAuth: [] }],
        responses: {
          200: {
            description: 'Feed source list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sources: { type: 'array', items: { $ref: '#/components/schemas/Source' } },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/admin/ranking': {
      post: {
        tags: ['Admin Automation Workers'],
        summary: 'Trigger Full Algorithmic Ranking Pass',
        description: 'Recomputes trending scores, velocity metrics, and freshness decay for all published news articles.',
        security: [{ AdminSecretHeader: [] }, { AdminBearerAuth: [] }, { AdminCookieAuth: [] }],
        responses: {
          200: {
            description: 'Ranking pass completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    ranked: { type: 'integer', example: 120 },
                    message: { type: 'string', example: 'Re-ranked 120 articles' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/admin/ingest': {
      post: {
        tags: ['Admin Automation Workers'],
        summary: 'Trigger Multi-Source RSS Ingestion Crawl',
        security: [{ AdminSecretHeader: [] }, { AdminBearerAuth: [] }, { AdminCookieAuth: [] }],
        responses: {
          200: {
            description: 'Ingest cycle started',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    imported: { type: 'integer', example: 14 },
                    sourcesProcessed: { type: 'integer', example: 185 },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};

// Serve raw OpenAPI 3.0 JSON specification
router.get('/openapi.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json(openApiSpec);
});

// Serve interactive API documentation HTML page
router.get('/', (req, res) => {
  const uiType = String(req.query.ui || 'clean').toLowerCase();

  // 1. Swagger UI View (if requested via ?ui=swagger)
  if (uiType === 'swagger') {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NewsFree365 API Documentation • Swagger Explorer</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/svg+xml" href="https://newsfree365.live/icon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; background: #f8fafc; color: #0f172a; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
    .topbar { display: none !important; }
    .custom-header {
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #e2e8f0;
      padding: 12px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.03);
    }
    .brand-wrap { display: flex; align-items: center; gap: 12px; text-decoration: none; color: #0f172a; }
    .brand-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
    }
    .brand-title { font-size: 15px; font-weight: 800; letter-spacing: -0.3px; color: #0f172a; }
    .brand-badge { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
    .nav-tabs { display: flex; align-items: center; gap: 6px; }
    .nav-tab {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 7px 14px;
      border-radius: 9px;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s ease;
      color: #64748b;
      background: #f1f5f9;
      border: 1px solid transparent;
    }
    .nav-tab svg { width: 14px; height: 14px; stroke-width: 2.2; flex-shrink: 0; }
    .nav-tab:hover { color: #0f172a; background: #e2e8f0; }
    .nav-tab.active { color: #2563eb; background: #eff6ff; border-color: #bfdbfe; }
    .swagger-ui { max-width: 1320px; margin: 0 auto; padding: 24px 20px 80px; }
  </style>
</head>
<body>
  <div class="custom-header">
    <a href="/api/docs" class="brand-wrap">
      <div class="brand-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 6h10"></path><path d="M6 10h10"></path><path d="M6 14h6"></path></svg>
      </div>
      <div>
        <span class="brand-title">NewsFree365 API</span>
        <span class="brand-badge">Swagger Explorer</span>
      </div>
    </a>
    <div class="nav-tabs">
      <a href="/api/docs" class="nav-tab">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>
        <span>Clean Light Portal</span>
      </a>
      <a href="/api/docs?ui=scalar" class="nav-tab">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m13 2-2 10h5L11 22l2-10H8Z"/></svg>
        <span>Scalar View</span>
      </a>
      <a href="/api/docs?ui=swagger" class="nav-tab active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        <span>Swagger View</span>
      </a>
      <a href="/api/docs/openapi.json" target="_blank" class="nav-tab">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <span>JSON Spec</span>
      </a>
      <a href="http://localhost:3050/admin/docs" class="nav-tab">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        <span>Admin Sandbox</span>
      </a>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/api/docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "BaseLayout",
        docExpansion: "list"
      });
    };
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }

  // 2. Scalar View (if requested via ?ui=scalar)
  if (uiType === 'scalar') {
    const scalarHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>NewsFree365 API Reference • Scalar</title>
    <link rel="icon" type="image/svg+xml" href="https://newsfree365.live/icon.svg" />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
    <style>
      body { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; background: #ffffff; }
      .docs-header {
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid #e2e8f0;
        padding: 12px 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.03);
      }
      .brand-wrap { display: flex; align-items: center; gap: 12px; text-decoration: none; color: #0f172a; }
      .brand-icon {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
      }
      .brand-title { font-size: 15px; font-weight: 800; letter-spacing: -0.3px; color: #0f172a; }
      .brand-badge { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
      .docs-nav { display: flex; align-items: center; gap: 6px; }
      .docs-tab {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 7px 14px;
        border-radius: 9px;
        font-size: 12px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.15s ease;
        color: #64748b;
        background: #f1f5f9;
        border: 1px solid transparent;
      }
      .docs-tab svg { width: 14px; height: 14px; stroke-width: 2.2; flex-shrink: 0; }
      .docs-tab:hover { color: #0f172a; background: #e2e8f0; }
      .docs-tab.active { color: #2563eb; background: #eff6ff; border-color: #bfdbfe; }
    </style>
  </head>
  <body>
    <div class="docs-header">
      <a href="/api/docs" class="brand-wrap">
        <div class="brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 6h10"></path><path d="M6 10h10"></path><path d="M6 14h6"></path></svg>
        </div>
        <div>
          <span class="brand-title">NewsFree365 API</span>
          <span class="brand-badge">Scalar Reference</span>
        </div>
      </a>
      <div class="docs-nav">
        <a href="/api/docs" class="docs-tab">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>
          <span>Clean Light Portal</span>
        </a>
        <a href="/api/docs?ui=scalar" class="docs-tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m13 2-2 10h5L11 22l2-10H8Z"/></svg>
          <span>Scalar View</span>
        </a>
        <a href="/api/docs?ui=swagger" class="docs-tab">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          <span>Swagger View</span>
        </a>
        <a href="/api/docs/openapi.json" target="_blank" class="docs-tab">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span>JSON Spec</span>
        </a>
        <a href="http://localhost:3050/admin/docs" class="docs-tab">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          <span>Admin Sandbox</span>
        </a>
      </div>
    </div>
    <script id="api-reference" data-url="/api/docs/openapi.json" data-configuration='{"theme": "default", "darkMode": false, "showSidebar": true, "layout": "modern"}'></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(scalarHtml);
  }

  // 3. Default: High-Performance, Ultra-Clean Light Mode API Portal with Live Playground
  const specJson = JSON.stringify(openApiSpec);

  // Transform spec paths into structured array for server-side pre-render
  const serverEndpoints = [];
  Object.keys(openApiSpec.paths).forEach(path => {
    const pathItem = openApiSpec.paths[path];
    ['get', 'post', 'put', 'delete'].forEach(method => {
      if (pathItem[method]) {
        const op = pathItem[method];
        serverEndpoints.push({
          id: method + '-' + path.replace(/[^a-zA-Z0-9]/g, '-'),
          method: method.toUpperCase(),
          path: path,
          tag: op.tags && op.tags[0] ? op.tags[0] : 'General',
          summary: op.summary || '',
          description: op.description || '',
          parameters: op.parameters || [],
          requestBody: op.requestBody || null,
          responses: op.responses || {},
          security: op.security || null,
        });
      }
    });
  });

  const serverTags = Array.from(new Set(serverEndpoints.map(e => e.tag)));

  const cleanPortalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NewsFree365 API Reference & Interactive Playground</title>
  <link rel="icon" type="image/svg+xml" href="https://newsfree365.live/icon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-page: #f8fafc;
      --bg-card: #ffffff;
      --bg-subtle: #f1f5f9;
      --bg-input: #ffffff;
      --border-color: #e2e8f0;
      --border-focus: #3b82f6;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --text-light: #94a3b8;
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --primary-light: #eff6ff;
      --emerald: #059669;
      --emerald-light: #ecfdf5;
      --amber: #d97706;
      --amber-light: #fffbeb;
      --rose: #e11d48;
      --rose-light: #fff1f2;
      --purple: #7c3aed;
      --purple-light: #f5f3ff;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 14px;
      --radius-xl: 18px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-page);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Top Sticky Navigation */
    .top-nav {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 28px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.03);
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--text-main);
    }
    .brand-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
    }
    .brand-title {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: -0.3px;
    }
    .brand-badge {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 7px 14px;
      border-radius: var(--radius-md);
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      color: var(--text-muted);
      background: var(--bg-subtle);
      border: 1px solid transparent;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .nav-btn svg {
      width: 14px;
      height: 14px;
      stroke-width: 2.2;
      flex-shrink: 0;
    }
    .nav-btn:hover {
      color: var(--text-main);
      background: #e2e8f0;
    }
    .nav-btn.active {
      color: var(--primary);
      background: var(--primary-light);
      border-color: #bfdbfe;
    }

    /* Main Container */
    .app-container {
      display: flex;
      max-width: 1440px;
      margin: 0 auto;
      min-height: calc(100vh - 61px);
    }

    /* Left Sidebar */
    .sidebar {
      width: 280px;
      min-width: 280px;
      max-width: 280px;
      flex-shrink: 0;
      background: #ffffff;
      border-right: 1px solid var(--border-color);
      padding: 20px 16px;
      position: sticky;
      top: 61px;
      height: calc(100vh - 61px);
      overflow-y: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .sidebar::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }
    .search-box {
      position: relative;
      margin-bottom: 8px;
    }
    .search-box svg {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-light);
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      padding: 8px 12px 8px 32px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      font-size: 13px;
      color: var(--text-main);
      background: var(--bg-subtle);
      transition: all 0.15s;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--border-focus);
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .filter-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 8px;
      background: var(--bg-subtle);
      padding: 3px;
      border-radius: var(--radius-md);
    }
    .filter-tab {
      flex: 1;
      text-align: center;
      padding: 5px 6px;
      font-size: 11px;
      font-weight: 700;
      border-radius: var(--radius-sm);
      cursor: pointer;
      color: var(--text-muted);
      border: none;
      background: transparent;
      transition: all 0.15s;
    }
    .filter-tab.active {
      background: #ffffff;
      color: var(--primary);
      box-shadow: var(--shadow-sm);
    }

    .sidebar-section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-light);
      margin: 8px 4px 4px;
    }
    .sidebar-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      border-radius: var(--radius-md);
      color: var(--text-muted);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .sidebar-item:hover {
      background: var(--bg-subtle);
      color: var(--text-main);
    }
    .sidebar-item.active {
      background: var(--primary-light);
      color: var(--primary);
      font-weight: 700;
    }
    .sidebar-count {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 999px;
      background: var(--bg-subtle);
      color: var(--text-muted);
    }
    .sidebar-item.active .sidebar-count {
      background: #dbeafe;
      color: var(--primary);
    }

    /* Content Area */
    .content-area {
      flex: 1;
      min-width: 0;
      padding: 32px 40px;
    }

    /* Hero Banner */
    .hero-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 24px 28px;
      box-shadow: var(--shadow-sm);
      margin-bottom: 28px;
    }
    .hero-title {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }
    .hero-desc {
      font-size: 14px;
      color: var(--text-muted);
      max-width: 800px;
      line-height: 1.6;
    }

    /* Category Section */
    .category-group {
      margin-bottom: 36px;
      scroll-margin-top: 80px;
    }
    .category-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--border-color);
    }
    .category-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.3px;
    }
    .category-desc {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Endpoint Card */
    .endpoint-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      margin-bottom: 12px;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .endpoint-card:hover {
      border-color: #cbd5e1;
      box-shadow: var(--shadow-md);
    }
    .endpoint-header {
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      cursor: pointer;
      user-select: none;
      background: #ffffff;
    }
    .endpoint-summary-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
      flex: 1;
    }
    .method-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      letter-spacing: 0.5px;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .method-get { background: var(--primary-light); color: var(--primary); border: 1px solid #bfdbfe; }
    .method-post { background: var(--emerald-light); color: var(--emerald); border: 1px solid #a7f3d0; }
    .method-put { background: var(--amber-light); color: var(--amber); border: 1px solid #fde68a; }
    .method-delete { background: var(--rose-light); color: var(--rose); border: 1px solid #fecdd3; }

    .endpoint-path {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
    }
    .endpoint-desc {
      font-size: 13px;
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .endpoint-badges {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .auth-tag {
      font-size: 10px;
      font-weight: 700;
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      gap: 3px;
    }

    /* Endpoint Body Expanded */
    .endpoint-details {
      display: none;
      padding: 20px 24px;
      background: #fafafa;
      border-top: 1px solid var(--border-color);
    }
    .endpoint-card.open .endpoint-details {
      display: block;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media (max-width: 1024px) {
      .details-grid { grid-template-columns: 1fr; }
    }

    .detail-section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .param-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 16px;
      background: #ffffff;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      overflow: hidden;
    }
    .param-table th {
      background: var(--bg-subtle);
      padding: 8px 12px;
      text-align: left;
      font-weight: 700;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border-color);
    }
    .param-table td {
      padding: 8px 12px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-main);
    }
    .param-table tr:last-child td { border-bottom: none; }
    .param-name { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--primary); }
    .param-type { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--purple); }
    .param-required { color: var(--rose); font-weight: 700; font-size: 10px; margin-left: 4px; }

    /* Interactive Playground Box */
    .playground-box {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 16px;
      box-shadow: var(--shadow-sm);
    }
    .play-input-group {
      margin-bottom: 10px;
    }
    .play-input-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 4px;
      display: block;
    }
    .play-input {
      width: 100%;
      padding: 7px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      background: var(--bg-subtle);
    }
    .play-input:focus {
      outline: none;
      border-color: var(--border-focus);
      background: #ffffff;
    }
    .execute-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--primary);
      color: white;
      font-weight: 700;
      font-size: 12px;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
      transition: background 0.15s ease;
    }
    .execute-btn:hover { background: var(--primary-hover); }
    .execute-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Code & Response Display - Pure Clean Light Mode */
    .code-box {
      background: #f8fafc;
      color: #0f172a;
      border: 1px solid #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      padding: 12px 14px;
      border-radius: var(--radius-md);
      overflow-x: auto;
      max-height: 280px;
      position: relative;
    }
    .code-box pre {
      margin: 0;
      font-family: 'JetBrains Mono', monospace;
      color: #0f172a;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .json-key { color: #4338ca; font-weight: 600; }
    .json-string { color: #059669; }
    .json-number { color: #2563eb; font-weight: 600; }
    .json-boolean { color: #d97706; font-weight: 700; }
    .json-null { color: #94a3b8; font-style: italic; }

    .response-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
      margin-bottom: 6px;
    }
    .status-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }
    .status-200 { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .status-error { background: #fff1f2; color: #9f1239; border: 1px solid #fecdd3; }
    .latency-tag { font-size: 11px; color: var(--text-muted); font-weight: 600; }

    .copy-btn {
      background: #ffffff;
      color: #334155;
      border: 1px solid #cbd5e1;
      border-radius: var(--radius-sm);
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .copy-btn:hover { background: #f1f5f9; color: #0f172a; border-color: #94a3b8; }

    /* Empty state */
    .no-results {
      padding: 40px;
      text-align: center;
      color: var(--text-muted);
      font-size: 14px;
    }
  </style>
</head>
<body>
  <!-- Top Navigation Header -->
  <header class="top-nav">
    <a href="/api/docs" class="brand-section">
      <div class="brand-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 6h10"></path><path d="M6 10h10"></path><path d="M6 14h6"></path></svg>
      </div>
      <div>
        <span class="brand-title">NewsFree365 API</span>
        <span class="brand-badge">v2.0 OAS 3.0</span>
      </div>
    </a>
    <div class="nav-actions">
      <a href="/api/docs" class="nav-btn active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>
        <span>Clean Light Portal</span>
      </a>
      <a href="/api/docs?ui=scalar" class="nav-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m13 2-2 10h5L11 22l2-10H8Z"/></svg>
        <span>Scalar View</span>
      </a>
      <a href="/api/docs?ui=swagger" class="nav-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        <span>Swagger View</span>
      </a>
      <a href="/api/docs/openapi.json" target="_blank" class="nav-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <span>JSON Spec</span>
      </a>
      <a href="http://localhost:3050/admin/docs" class="nav-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        <span>Admin Sandbox</span>
      </a>
    </div>
  </header>

  <!-- App Body Layout -->
  <div class="app-container">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="search-box">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" id="apiSearchInput" class="search-input" placeholder="Search endpoints..." oninput="filterEndpoints()" />
      </div>

      <div class="filter-tabs">
        <button class="filter-tab active" onclick="setMethodFilter('ALL', this)">ALL</button>
        <button class="filter-tab" onclick="setMethodFilter('GET', this)">GET</button>
        <button class="filter-tab" onclick="setMethodFilter('POST', this)">POST</button>
      </div>

      <div class="sidebar-section-title">API Modules</div>
      <div id="sidebarCategories">
        ${serverTags.map(tag => {
          const count = serverEndpoints.filter(e => e.tag === tag).length;
          const tagSlug = tag.replace(/[^a-zA-Z0-9]/g, '-');
          return `
            <a href="#cat-${tagSlug}" class="sidebar-item" onclick="selectSidebarItem(this)">
              <span>${tag}</span>
              <span class="sidebar-count">${count}</span>
            </a>
          `;
        }).join('')}
      </div>
    </aside>

    <!-- Main Content -->
    <main class="content-area">
      <!-- Hero Overview Banner -->
      <div class="hero-card">
        <h1 class="hero-title">High-Performance Intelligence & News API</h1>
        <p class="hero-desc">
          Interactive developer reference and real-time execution playground. Test live endpoints for news feeds, Cricbuzz cricket hubs, Tribuna football fixtures, market indicators, daily quizzes, community polls, and administrative management.
        </p>
      </div>

      <!-- Endpoints List -->
      <div id="endpointsContainer">
        ${serverTags.map(tag => {
          const tagSlug = tag.replace(/[^a-zA-Z0-9]/g, '-');
          const tagEndpoints = serverEndpoints.filter(ep => ep.tag === tag);
          if (tagEndpoints.length === 0) return '';
          return `
            <section id="cat-${tagSlug}" class="category-group">
              <div class="category-header">
                <div>
                  <h2 class="category-title">${tag}</h2>
                  <span class="category-desc">${tagEndpoints.length} operations</span>
                </div>
              </div>
              ${tagEndpoints.map(ep => {
                const methodClass = 'method-' + ep.method.toLowerCase();
                const hasAuth = ep.security && ep.security.length > 0;
                return `
                  <div class="endpoint-card" id="${ep.id}">
                    <div class="endpoint-header" onclick="toggleCard('${ep.id}')">
                      <div class="endpoint-summary-left">
                        <span class="method-badge ${methodClass}">${ep.method}</span>
                        <span class="endpoint-path">${ep.path}</span>
                        <span class="endpoint-desc">— ${ep.summary}</span>
                      </div>
                      <div class="endpoint-badges">
                        ${hasAuth ? '<span class="auth-tag">🔒 Admin Protected</span>' : ''}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>

                    <div class="endpoint-details">
                      <div class="details-grid">
                        <!-- Left column: Schema & Parameters -->
                        <div>
                          <p style="font-size: 13px; color: #475569; margin-bottom: 16px; line-height: 1.5;">${ep.description || ep.summary}</p>

                          ${ep.parameters && ep.parameters.length > 0 ? `
                            <div class="detail-section-title">Parameters</div>
                            <table class="param-table">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>In</th>
                                  <th>Type</th>
                                  <th>Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${ep.parameters.map(p => `
                                  <tr>
                                    <td>
                                      <span class="param-name">${p.name}</span>
                                      ${p.required ? '<span class="param-required">*</span>' : ''}
                                    </td>
                                    <td style="color: #64748b; font-size: 11px;">${p.in}</td>
                                    <td class="param-type">${p.schema ? p.schema.type : 'string'}</td>
                                    <td style="color: #475569; font-size: 12px;">${p.description || '-'}</td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>
                          ` : ''}

                          <div class="detail-section-title">cURL Command</div>
                          <div class="code-box">
                            <pre id="curl-${ep.id}">curl -X ${ep.method} "http://localhost:4050${ep.path}"${hasAuth ? ' -H "x-admin-secret: <YOUR_ADMIN_SECRET>"' : ''}</pre>
                          </div>
                        </div>

                        <!-- Right column: Interactive Sandbox Runner -->
                        <div class="playground-box">
                          <div class="detail-section-title">
                            <span>⚡ Interactive Playground</span>
                          </div>

                          ${ep.parameters && ep.parameters.length > 0 ? `
                            <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">Parameters</div>
                            ${ep.parameters.map(p => `
                              <div class="form-row" style="margin-bottom: 8px;">
                                <label class="play-input-label">${p.name} (${p.in})${p.required ? ' *' : ''}</label>
                                <input type="text" id="param-${ep.id}-${p.name}" class="play-input" placeholder="${p.description || p.name}" value="${p.schema && p.schema.default !== undefined ? p.schema.default : ''}" />
                              </div>
                            `).join('')}
                          ` : ''}

                          ${ep.requestBody ? `
                            <div class="form-row" style="margin-bottom: 8px;">
                              <label class="play-input-label">Request Body (JSON)</label>
                              <textarea id="body-${ep.id}" class="play-input" style="height: 70px; resize: vertical;" placeholder="Enter JSON payload">{}</textarea>
                            </div>
                          ` : ''}

                          ${hasAuth ? `
                            <div class="form-row" style="margin-bottom: 8px;">
                              <label class="play-input-label">Admin Secret Key (Optional if already logged in)</label>
                              <input type="password" id="auth-${ep.id}" class="play-input" placeholder="Enter admin key to override" autocomplete="current-password" />
                            </div>
                          ` : ''}

                          <div style="margin-top: 12px; display: flex; align-items: center; gap: 8px;">
                            <button class="execute-btn" onclick="executeEndpoint('${ep.id}', '${ep.method}', '${ep.path}', ${hasAuth})">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                              <span>Send Request</span>
                            </button>
                          </div>

                          <div class="response-header">
                            <div style="display: flex; align-items: center; gap: 8px;">
                              <span class="status-badge" id="res-status-${ep.id}" style="display: none;">200 OK</span>
                              <span id="res-time-${ep.id}" class="latency-tag"></span>
                            </div>
                            <button class="copy-btn" onclick="copyResponse('${ep.id}')">Copy JSON</button>
                          </div>
                          <div class="code-box">
                            <pre id="res-body-${ep.id}">Click "Send Request" to execute live API test</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </section>
          `;
        }).join('')}
      </div>
    </main>
  </div>

  <script>
    const spec = ${specJson};
    let activeMethodFilter = 'ALL';
    let searchQuery = '';

    // Transform spec paths into structured array
    const endpoints = [];
    Object.keys(spec.paths).forEach(path => {
      const pathItem = spec.paths[path];
      ['get', 'post', 'put', 'delete'].forEach(method => {
        if (pathItem[method]) {
          const op = pathItem[method];
          endpoints.push({
            id: method + '-' + path.replace(/[^a-zA-Z0-9]/g, '-'),
            method: method.toUpperCase(),
            path: path,
            tag: op.tags && op.tags[0] ? op.tags[0] : 'General',
            summary: op.summary || '',
            description: op.description || '',
            parameters: op.parameters || [],
            requestBody: op.requestBody || null,
            responses: op.responses || {},
            security: op.security || null,
          });
        }
      });
    });

    // Group by Tags
    const tags = Array.from(new Set(endpoints.map(e => e.tag)));

    function renderSidebar() {
      const container = document.getElementById('sidebarCategories');
      container.innerHTML = tags.map(tag => {
        const count = endpoints.filter(e => e.tag === tag).length;
        const tagSlug = tag.replace(/[^a-zA-Z0-9]/g, '-');
        return \`
          <a href="#cat-\${tagSlug}" class="sidebar-item" onclick="selectSidebarItem(this)">
            <span>\${tag}</span>
            <span class="sidebar-count">\${count}</span>
          </a>
        \`;
      }).join('');
    }

    function selectSidebarItem(el) {
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      el.classList.add('active');
    }

    function setMethodFilter(method, btn) {
      activeMethodFilter = method;
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderEndpoints();
    }

    function filterEndpoints() {
      searchQuery = document.getElementById('apiSearchInput').value.toLowerCase().trim();
      renderEndpoints();
    }

    function toggleCard(cardId) {
      const card = document.getElementById(cardId);
      card.classList.toggle('open');
    }

    function copyToClip(text) {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }

    function syntaxHighlight(json) {
      if (typeof json !== 'string') {
        json = JSON.stringify(json, undefined, 2);
      }
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)/g, function (match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });
    }

    function renderEndpoints() {
      const container = document.getElementById('endpointsContainer');
      let html = '';

      tags.forEach(tag => {
        const tagSlug = tag.replace(/[^a-zA-Z0-9]/g, '-');
        const tagEndpoints = endpoints.filter(ep => {
          const matchesTag = ep.tag === tag;
          const matchesMethod = activeMethodFilter === 'ALL' || ep.method === activeMethodFilter;
          const matchesSearch = !searchQuery ||
            ep.path.toLowerCase().includes(searchQuery) ||
            ep.summary.toLowerCase().includes(searchQuery) ||
            ep.description.toLowerCase().includes(searchQuery);
          return matchesTag && matchesMethod && matchesSearch;
        });

        if (tagEndpoints.length === 0) return;

        html += \`
          <section id="cat-\${tagSlug}" class="category-group">
            <div class="category-header">
              <div>
                <h2 class="category-title">\${tag}</h2>
                <span class="category-desc">\${tagEndpoints.length} operations</span>
              </div>
            </div>
        \`;

        tagEndpoints.forEach(ep => {
          const methodClass = 'method-' + ep.method.toLowerCase();
          const hasAuth = ep.security && ep.security.length > 0;

          html += \`
            <div class="endpoint-card" id="\${ep.id}">
              <div class="endpoint-header" onclick="toggleCard('\${ep.id}')">
                <div class="endpoint-summary-left">
                  <span class="method-badge \${methodClass}">\${ep.method}</span>
                  <span class="endpoint-path">\${ep.path}</span>
                  <span class="endpoint-desc">— \${ep.summary}</span>
                </div>
                <div class="endpoint-badges">
                  \${hasAuth ? '<span class="auth-tag">🔒 Admin Protected</span>' : ''}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>

              <div class="endpoint-details">
                <div class="details-grid">
                  <!-- Left column: Schema & Parameters -->
                  <div>
                    <p style="font-size: 13px; color: #475569; margin-bottom: 16px; line-height: 1.5;">\${ep.description || ep.summary}</p>

                    \${ep.parameters && ep.parameters.length > 0 ? \`
                      <div class="detail-section-title">Parameters</div>
                      <table class="param-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>In</th>
                            <th>Type</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          \${ep.parameters.map(p => \`
                            <tr>
                              <td>
                                <span class="param-name">\${p.name}</span>
                                \${p.required ? '<span class="param-required">*</span>' : ''}
                              </td>
                              <td style="color: #64748b; font-size: 11px;">\${p.in}</td>
                              <td class="param-type">\${p.schema ? p.schema.type : 'string'}</td>
                              <td style="color: #475569; font-size: 12px;">\${p.description || '-'}</td>
                            </tr>
                          \`).join('')}
                        </tbody>
                      </table>
                    \` : ''}

                    <div class="detail-section-title">cURL Command</div>
                    <div class="code-box">
                      <pre id="curl-\${ep.id}">curl -X \${ep.method} "http://localhost:4050\${ep.path}"\${hasAuth ? ' -H "x-admin-secret: <YOUR_ADMIN_SECRET>"' : ''}</pre>
                    </div>
                  </div>

                  <!-- Right column: Interactive Sandbox Runner -->
                  <div class="playground-box">
                    <div class="detail-section-title">
                      <span>⚡ Interactive Playground</span>
                    </div>

                    \${hasAuth ? \`
                      <div class="play-input-group">
                        <label class="play-input-label">Admin Secret Key (x-admin-secret):</label>
                        <input type="password" id="auth-\${ep.id}" class="play-input" placeholder="Enter administrative secret key" />
                      </div>
                    \` : ''}

                    \${ep.parameters && ep.parameters.length > 0 ? \`
                      <div style="margin-bottom: 12px;">
                        \${ep.parameters.map(p => \`
                          <div class="play-input-group">
                            <label class="play-input-label">\${p.name} (\${p.in}):</label>
                            <input type="text" id="input-\${ep.id}-\${p.name}" class="play-input" placeholder="\${p.schema && p.schema.default !== undefined ? p.schema.default : (p.description || '')}" value="\${p.schema && p.schema.default !== undefined ? p.schema.default : ''}" />
                          </div>
                        \`).join('')}
                      </div>
                    \` : ''}

                    \${ep.method !== 'GET' ? \`
                      <div class="play-input-group">
                        <label class="play-input-label">Request Body (JSON):</label>
                        <textarea id="body-\${ep.id}" class="play-input" style="height: 90px; resize: vertical;" placeholder='{"key": "value"}'></textarea>
                      </div>
                    \` : ''}

                    <button class="execute-btn" onclick="executeApiCall('\${ep.id}', '\${ep.method}', '\${ep.path}', \${hasAuth})">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Send Request
                    </button>

                    <!-- Response Preview Container -->
                    <div id="res-box-\${ep.id}" style="display: none; margin-top: 14px;">
                      <div class="response-header">
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span id="res-status-\${ep.id}" class="status-badge">200 OK</span>
                          <span id="res-time-\${ep.id}" class="latency-tag">0ms</span>
                        </div>
                        <button class="copy-btn" onclick="copyResponse('\${ep.id}')">Copy Response</button>
                      </div>
                      <div class="code-box">
                        <pre id="res-body-\${ep.id}">Loading...</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          \`;
        });

        html += '</section>';
      });

      if (!html) {
        html = '<div class="no-results">No endpoints matching the criteria were found.</div>';
      }

      container.innerHTML = html;
    }

    async function executeApiCall(id, method, pathPattern, hasAuth) {
      const ep = endpoints.find(e => e.id === id);
      const resBox = document.getElementById('res-box-' + id);
      const resStatus = document.getElementById('res-status-' + id);
      const resTime = document.getElementById('res-time-' + id);
      const resBody = document.getElementById('res-body-' + id);

      resBox.style.display = 'block';
      resStatus.className = 'status-badge status-200';
      resStatus.textContent = 'Executing...';
      resBody.textContent = 'Sending request to API server...';

      let url = 'http://localhost:4050' + pathPattern;
      const queryParams = new URLSearchParams();

      if (ep && ep.parameters) {
        ep.parameters.forEach(p => {
          const input = document.getElementById('input-' + id + '-' + p.name);
          const val = input ? input.value.trim() : '';
          if (p.in === 'path') {
            url = url.replace('{' + p.name + '}', encodeURIComponent(val || '1'));
          } else if (p.in === 'query' && val) {
            queryParams.append(p.name, val);
          }
        });
      }

      if (queryParams.toString()) {
        url += '?' + queryParams.toString();
      }

      const headers = { 'Content-Type': 'application/json' };
      if (hasAuth) {
        const authInput = document.getElementById('auth-' + id);
        const secret = authInput ? authInput.value.trim() : '';
        if (secret) {
          headers['x-admin-secret'] = secret;
          headers['Authorization'] = 'Bearer ' + secret;
        }
      }

      const options = { method, headers };
      if (method !== 'GET') {
        const bodyInput = document.getElementById('body-' + id);
        if (bodyInput && bodyInput.value.trim()) {
          options.body = bodyInput.value.trim();
        }
      }

      const startTime = performance.now();
      try {
        const response = await fetch(url, options);
        const duration = Math.round(performance.now() - startTime);

        resTime.textContent = duration + 'ms';
        resStatus.textContent = response.status + ' ' + response.statusText;
        resStatus.className = 'status-badge ' + (response.ok ? 'status-200' : 'status-error');

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          resBody.innerHTML = syntaxHighlight(data);
        } else {
          const text = await response.text();
          resBody.textContent = text;
        }
      } catch (err) {
        const duration = Math.round(performance.now() - startTime);
        resTime.textContent = duration + 'ms';
        resStatus.textContent = 'Error';
        resStatus.className = 'status-badge status-error';
        resBody.textContent = 'Network Error: ' + err.message;
      }
    }

    function copyResponse(id) {
      const text = document.getElementById('res-body-' + id).innerText;
      navigator.clipboard.writeText(text);
      alert('Response copied to clipboard!');
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(cleanPortalHtml);
});

export default router;
