import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import postRoutes from './routes/post.routes.js';
import metaRoutes from './routes/meta.routes.js';
import newsRoutes from './routes/news.routes.js';
import adminRoutes from './routes/admin.routes.js';
import cricketRoutes from './routes/cricket.routes.js';
import footballRoutes from './routes/football.routes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Static serving for generated social cards
app.use('/social-cards', express.static(path.resolve(__dirname, '../../frontend/public/social-cards')));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'policydrift-api' });
});

// Dynamic social card endpoint fallback
app.get('/api/social/card', async (req, res) => {
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const nextBase = process.env.NEXT_INTERNAL_URL || 'http://127.0.0.1:3000';

  try {
    const upstream = await fetch(`${nextBase}/api/social/card${query}`);
    if (upstream.ok) {
      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    }
  } catch {
    // Next.js internal not reachable
  }

  // Fallback to direct background image if provided
  if (req.query.image) {
    return res.redirect(req.query.image);
  }

  res.status(404).send('Social card renderer');
});

app.use('/api', postRoutes);
app.use('/api/meta', metaRoutes);
// v2 public news endpoints (latest / top / trending / popular / :slug)
app.use('/api/news', newsRoutes);
// v2 admin endpoints (protected by requireAdmin middleware)
app.use('/api/admin', adminRoutes);
// Cricbuzz live and completed cricket score endpoints
app.use('/api/cricket', cricketRoutes);
app.use('/api/cricket-proxy', cricketRoutes);
// Tribuna live and completed football match endpoints
app.use('/api/football', footballRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
