# 📂 Monorepo Structure

## Current Organization

```
policydrift-news/
│
├── 📱 apps/                          # Application packages
│   │
│   ├── 🎨 frontend/                  # React + Vite application
│   │   ├── src/                      # Source code
│   │   │   ├── components/           # Reusable React components
│   │   │   ├── pages/                # Page components
│   │   │   ├── contexts/             # React contexts (Auth, Theme, etc.)
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── lib/                  # Utilities and helpers
│   │   │   ├── App.jsx               # Main app component
│   │   │   ├── main.jsx              # Entry point
│   │   │   └── index.css             # Global styles
│   │   │
│   │   ├── public/                   # Static assets
│   │   ├── index.html                # HTML template
│   │   ├── package.json              # Frontend dependencies
│   │   ├── vite.config.js            # Vite configuration
│   │   ├── tailwind.config.js        # Tailwind CSS config
│   │   ├── .env.example              # Environment template
│   │   └── node_modules/             # Dependencies (auto-generated)
│   │
│   └── ⚙️ backend/                    # Node.js + Express API
│       ├── src/                      # Source code
│       │   ├── config/               # Configuration files
│       │   │   ├── database.js       # MongoDB connection
│       │   │   ├── cloudinary.js     # Image upload config
│       │   │   └── env.js            # Environment variables
│       │   │
│       │   ├── models/               # Mongoose models
│       │   │   ├── User.js
│       │   │   ├── Article.js
│       │   │   ├── Category.js
│       │   │   ├── Tag.js
│       │   │   ├── Comment.js
│       │   │   ├── Bookmark.js
│       │   │   ├── Newsletter.js
│       │   │   └── SiteSettings.js
│       │   │
│       │   ├── controllers/          # Route controllers
│       │   │   ├── authController.js
│       │   │   ├── articleController.js
│       │   │   ├── categoryController.js
│       │   │   ├── tagController.js
│       │   │   ├── commentController.js
│       │   │   ├── bookmarkController.js
│       │   │   ├── newsletterController.js
│       │   │   ├── userController.js
│       │   │   └── siteSettingsController.js
│       │   │
│       │   ├── routes/               # API routes
│       │   │   ├── index.js          # Main router
│       │   │   ├── authRoutes.js
│       │   │   ├── articleRoutes.js
│       │   │   ├── categoryRoutes.js
│       │   │   ├── tagRoutes.js
│       │   │   ├── commentRoutes.js
│       │   │   ├── bookmarkRoutes.js
│       │   │   ├── newsletterRoutes.js
│       │   │   ├── userRoutes.js
│       │   │   └── siteSettingsRoutes.js
│       │   │
│       │   ├── middleware/           # Express middleware
│       │   │   ├── authMiddleware.js # JWT authentication
│       │   │   ├── adminMiddleware.js # Admin check
│       │   │   ├── errorHandler.js   # Error handling
│       │   │   ├── uploadMiddleware.js # File upload
│       │   │   └── validator.js      # Input validation
│       │   │
│       │   ├── validators/           # Request validators
│       │   │   ├── authValidator.js
│       │   │   ├── articleValidator.js
│       │   │   ├── categoryValidator.js
│       │   │   ├── tagValidator.js
│       │   │   └── commentValidator.js
│       │   │
│       │   ├── utils/                # Utility functions
│       │   │   ├── emailService.js   # Email notifications
│       │   │   ├── imageUpload.js    # Cloudinary upload
│       │   │   ├── pagination.js     # Pagination helper
│       │   │   └── validation.js     # Validation helpers
│       │   │
│       │   ├── app.js                # Express app setup
│       │   └── index.js              # Server entry point
│       │
│       ├── package.json              # Backend dependencies
│       ├── .env.example              # Environment template
│       ├── .gitignore                # Git ignore rules
│       └── node_modules/             # Dependencies (auto-generated)
│
├── 📄 package.json                   # Root workspace config
├── 📖 README.md                      # Main documentation
├── 📝 STRUCTURE.md                   # This file
├── 🔒 .gitignore                     # Git ignore rules
├── 📦 node_modules/                  # Root dependencies
└── 🔄 .git/                          # Git repository

```

## Key Features

### 🎯 Monorepo Benefits
- ✅ **Single Repository**: All code in one place
- ✅ **Unified Version Control**: One git history
- ✅ **Shared Dependencies**: Efficient package management
- ✅ **Easy Cross-referencing**: Navigate between apps easily
- ✅ **Consistent Tooling**: Same configs across projects
- ✅ **Atomic Changes**: Update frontend + backend together

### 📦 Workspace Management
Uses **npm workspaces** for dependency management:

```bash
# Install all dependencies (frontend + backend)
npm install

# Add package to specific workspace
npm install axios --workspace=apps/frontend
npm install express --workspace=apps/backend

# Run scripts in workspaces
npm run dev --workspace=apps/frontend
npm run dev --workspace=apps/backend
```

### 🚀 Commands

From root directory:

```bash
# Development
npm run dev              # Run both frontend & backend
npm run dev:frontend     # Run only frontend
npm run dev:backend      # Run only backend

# Build
npm run build            # Build frontend
npm run build:frontend   # Build frontend
npm run build:backend    # Build backend (if configured)

# Maintenance
npm run clean            # Remove all node_modules
npm install              # Install all dependencies
```

### 🌳 Tech Stack

**Frontend (apps/frontend)**
- React 19
- Vite 7
- Tailwind CSS
- React Router
- Axios

**Backend (apps/backend)**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary
- Nodemailer

### 🔐 Environment Variables

**Frontend** (`apps/frontend/.env.local`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=News Website
VITE_APP_URL=http://localhost:5173
```

**Backend** (`apps/backend/.env`)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
CLOUDINARY_CLOUD_NAME=your-cloud
# ... see apps/backend/.env.example for full list
```

### 📊 Port Configuration
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

### 🔄 Development Workflow

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rau238/policydrift-news.git
   cd policydrift-news
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env.local
   # Edit .env files with your credentials
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Make changes and commit**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin feature/SEO
   ```

---

**Built with ❤️ as a modern monorepo**
