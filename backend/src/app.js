const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { FRONTEND_URL, NODE_ENV, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(RATE_LIMIT_WINDOW_MS),
  max: parseInt(RATE_LIMIT_MAX_REQUESTS),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'News Website API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      articles: '/api/articles',
      categories: '/api/categories',
      tags: '/api/tags',
      comments: '/api/comments',
      bookmarks: '/api/bookmarks',
      newsletter: '/api/newsletter',
      users: '/api/users',
      siteSettings: '/api/site-settings'
    }
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
