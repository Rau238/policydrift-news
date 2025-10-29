# 📰 PolicyDrift News - Full Stack News Platform# 🗞️ Modern News Website# News Website - Full Stack Application



A professional, modern news website built as a monorepo with React (Vite) frontend and Node.js/Express/MongoDB backend. Features include article management, user authentication, comments, bookmarks, newsletter subscriptions, and a complete admin dashboard.



## 🏗️ Monorepo StructureA professional, full-stack news website built with React (Vite) frontend and Node.js/Express/MongoDB backend.A professional, modern news website built with React (Vite) frontend and Node.js/Express/MongoDB backend. Features include article management, user authentication, comments, bookmarks, newsletter subscriptions, and a complete admin dashboard.



```

policydrift-news/

├── apps/## ✨ Features## 🚀 Features

│   ├── frontend/          # React + Vite application

│   │   ├── src/

│   │   ├── public/

│   │   ├── package.json### Public Features### Frontend

│   │   └── vite.config.js

│   └── backend/           # Node.js + Express API- 📰 Article browsing with categories and tags- ✅ Modern React 19 with Vite

│       ├── src/

│       ├── package.json- 🔍 Advanced search and filtering- ✅ Responsive design with Tailwind CSS

│       └── .env.example

├── package.json           # Root workspace configuration- 💬 Comments system with likes- ✅ SEO optimized

└── README.md

```- 🔖 Bookmark favorite articles- ✅ Dark/Light theme support



## ✨ Features- 📧 Newsletter subscription- ✅ Image optimization



### Frontend (React + Vite)- 🌓 Dark/Light theme- ✅ Code splitting & lazy loading

- ✅ Modern React 19 with Vite

- ✅ Responsive design with Tailwind CSS- 📱 Fully responsive design- ✅ PWA ready

- ✅ SEO optimized with React Helmet

- ✅ Dark/Light theme support- ⚡ Fast loading with Vite

- ✅ Image optimization & lazy loading

- ✅ Code splitting for optimal performance### Backend

- ✅ PWA ready

- ✅ Article browsing with categories and tags### Admin Features- ✅ RESTful API with Express.js

- ✅ Advanced search and filtering

- ✅ Comments system with likes- ✍️ Create and manage articles with rich text editor- ✅ MongoDB with Mongoose ODM

- ✅ Bookmark favorite articles

- ✅ Newsletter subscription- 🖼️ Image upload with Cloudinary integration- ✅ JWT authentication with refresh tokens

- ✅ Social sharing

- ✅ AdSense integration ready- 📁 Category and tag management- ✅ Role-based access control (User/Admin)



### Backend (Node.js + Express)- 👥 User management and roles- ✅ Cloudinary image upload

- ✅ RESTful API with Express.js

- ✅ MongoDB with Mongoose ODM- 📊 Dashboard with statistics- ✅ Email notifications

- ✅ JWT authentication with refresh tokens

- ✅ Role-based access control (User/Admin)- ⚙️ Site settings configuration- ✅ Input validation

- ✅ Cloudinary image upload

- ✅ Email notifications (Gmail)- 🎨 Customizable branding- ✅ Rate limiting

- ✅ Input validation with express-validator

- ✅ Rate limiting & security (Helmet, CORS)- ✅ Security with Helmet & CORS

- ✅ Rich text editor support

- ✅ Comment moderation## 🚀 Quick Start (Single Command!)

- ✅ Bookmark management

- ✅ Newsletter subscriptions### Core Features

- ✅ Site settings management

### Option 1: MongoDB Atlas (Cloud - Recommended, No Installation)- 📰 Article management (CRUD)

## 🚀 Quick Start

- 👤 User authentication & profiles

### Prerequisites

- Node.js >= 18.0.0**Step 1: Setup MongoDB Atlas (5 minutes, one-time)**- 💬 Comments & replies

- npm >= 9.0.0

- MongoDB Atlas account (free tier available)1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)- 🔖 Bookmarks

- Cloudinary account (optional, for image uploads)

2. Create FREE account- 📧 Newsletter subscriptions

### Installation

3. Create a FREE cluster (M0 Sandbox)- 🏷️ Categories & tags

1. **Clone the repository**

```bash4. Create database user:- 🔍 Search functionality

git clone https://github.com/Rau238/policydrift-news.git

cd policydrift-news   - Username: `newsadmin`- 📊 Admin dashboard

```

   - Password: `YourSecurePassword123`- 🎨 Site settings management

2. **Install all dependencies**

```bash5. Network Access: Add IP `0.0.0.0/0` (allow from anywhere)

npm install

```6. Get connection string from "Connect" button## 📋 Prerequisites



This will install dependencies for both frontend and backend using npm workspaces.7. Update `backend/.env`:



3. **Configure Backend Environment**   ```bash- **Node.js** >= 18.0.0

```bash

cd apps/backend   MONGODB_URI=mongodb+srv://newsadmin:YourSecurePassword123@cluster0.xxxxx.mongodb.net/news_website?retryWrites=true&w=majority- **MongoDB** >= 5.0 (Local or Atlas)

cp .env.example .env

# Edit .env with your credentials   ```- **npm** >= 9.0.0

```

- **Cloudinary Account** (for image uploads)

Required environment variables:

- `MONGODB_URI` - MongoDB Atlas connection string**Step 2: Run the project**- **Gmail Account** (for email notifications)

- `JWT_SECRET` - Secret for JWT tokens

- `JWT_REFRESH_SECRET` - Secret for refresh tokens```bash

- `CLOUDINARY_*` - Cloudinary credentials (optional)

- `EMAIL_*` - Gmail credentials for notifications (optional)cd /Users/raunak/projects## 🛠️ Installation & Setup



4. **Configure Frontend Environment**npm run dev

```bash

cd apps/frontend```### 1. Clone the Repository

cp .env.example .env.local

# Edit .env.local if needed

```

That's it! 🎉```bash

5. **Run the application**

```bashgit clone <repository-url>

# From root directory

npm run dev### Option 2: Local MongoDBcd policydrift-news

```

```

This starts both backend (port 5000) and frontend (port 5173) with a single command!

If you prefer local MongoDB:

### Individual Commands

```bash### 2. Backend Setup

```bash

# Run only backend# Install MongoDB

npm run dev:backend

brew tap mongodb/brew```bash

# Run only frontend

npm run dev:frontendbrew install mongodb-community@7.0cd backend



# Build frontend for productionbrew services start mongodb-community@7.0

npm run build:frontend

# Install dependencies

# Clean all node_modules

npm run clean# Run projectnpm install

```

cd /Users/raunak/projects

## 📦 Workspace Management

npm run dev# Create .env file

This project uses npm workspaces for monorepo management:

```cp .env.example .env

```bash

# Install dependencies in all workspaces```

npm install

## 📦 What `npm run dev` Does

# Add a dependency to frontend

npm install <package> --workspace=apps/frontend**Configure Backend `.env`:**



# Add a dependency to backendThe single command starts:

npm install <package> --workspace=apps/backend

- ✅ Backend API server on `http://localhost:5000````env

# Run scripts in all workspaces

npm run lint --workspaces- ✅ Frontend dev server on `http://localhost:5173`# Server

npm run test --workspaces

```- ✅ Auto-restart on file changes (both servers)PORT=5000



## 🗄️ MongoDB Atlas SetupNODE_ENV=development



1. **Sign up for MongoDB Atlas****Open browser:** http://localhost:5173

   - Visit: https://www.mongodb.com/cloud/atlas/register

   - Create a free M0 cluster (512MB storage)# Database (Choose one)



2. **Get your connection string**## 🛠️ Technology Stack# Local MongoDB:

   - Click "Connect" on your cluster

   - Choose "Connect your application"MONGODB_URI=mongodb://localhost:27017/news_website

   - Copy the connection string

   - Replace `<password>` with your database user password### Frontend



3. **Update apps/backend/.env**- **React 19** - UI library# MongoDB Atlas:

```env

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/news-website?retryWrites=true&w=majority- **Vite 7** - Build tool and dev server# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/news_website

```

- **Tailwind CSS** - Styling

## 🖼️ Cloudinary Setup (Optional)

- **React Router** - Navigation# JWT Secrets (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

1. Sign up at https://cloudinary.com

2. Get your credentials from the dashboard- **Axios** - HTTP clientJWT_SECRET=your_generated_secret_here

3. Add to `apps/backend/.env`:

```env- **Lucide Icons** - Icon libraryJWT_REFRESH_SECRET=your_generated_refresh_secret_here

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_keyJWT_EXPIRE=7d

CLOUDINARY_API_SECRET=your_api_secret

```### BackendJWT_REFRESH_EXPIRE=30d



## 📧 Email Setup (Optional)- **Node.js** - Runtime



For newsletter and notification emails:- **Express** - Web framework# Cloudinary (Get from: https://cloudinary.com/console)



1. Enable 2-factor authentication on your Gmail account- **MongoDB** - DatabaseCLOUDINARY_CLOUD_NAME=your_cloud_name

2. Create an App Password: https://myaccount.google.com/apppasswords

3. Add to `apps/backend/.env`:- **Mongoose** - ODMCLOUDINARY_API_KEY=your_api_key

```env

EMAIL_HOST=smtp.gmail.com- **JWT** - AuthenticationCLOUDINARY_API_SECRET=your_api_secret

EMAIL_PORT=587

EMAIL_USER=your-email@gmail.com- **Cloudinary** - Image hosting

EMAIL_PASSWORD=your-app-password

EMAIL_FROM=your-email@gmail.com- **Nodemailer** - Email service# Email (Gmail App Password: https://myaccount.google.com/apppasswords)

```

EMAIL_HOST=smtp.gmail.com

## 🔐 Admin Account Setup

## 📁 Project StructureEMAIL_PORT=587

After starting the backend, create an admin account:

EMAIL_SECURE=false

```bash

POST http://localhost:5000/api/auth/register```EMAIL_USER=your_email@gmail.com

Content-Type: application/json

/Users/raunak/projects/EMAIL_PASSWORD=your_app_password

{

  "name": "Admin User",├── backend/                    # Node.js/Express APIEMAIL_FROM=noreply@newswebsite.com

  "email": "admin@example.com",

  "password": "SecurePassword123!",│   ├── src/EMAIL_FROM_NAME=News Website

  "role": "admin"

}│   │   ├── controllers/       # Route handlers

```

│   │   ├── models/            # MongoDB schemas# Frontend URL

## 🌐 API Endpoints

│   │   ├── routes/            # API endpointsFRONTEND_URL=http://localhost:5173

### Authentication

- `POST /api/auth/register` - Register new user│   │   ├── middleware/        # Auth, validation, errors```

- `POST /api/auth/login` - Login user

- `POST /api/auth/refresh` - Refresh access token│   │   └── config/            # Database, Cloudinary

- `POST /api/auth/logout` - Logout user

│   ├── .env                   # Environment variables**Start Backend:**

### Articles

- `GET /api/articles` - Get all articles (with pagination)│   └── package.json

- `GET /api/articles/:id` - Get single article

- `POST /api/articles` - Create article (admin only)│```bash

- `PUT /api/articles/:id` - Update article (admin only)

- `DELETE /api/articles/:id` - Delete article (admin only)├── news-website/              # React/Vite Frontendnpm run dev



### Categories & Tags│   ├── src/```

- `GET /api/categories` - Get all categories

- `POST /api/categories` - Create category (admin only)│   │   ├── components/       # Reusable components

- `GET /api/tags` - Get all tags

- `POST /api/tags` - Create tag (admin only)│   │   ├── pages/            # Page componentsBackend will run on `http://localhost:5000`



### Comments│   │   ├── contexts/         # React contexts

- `GET /api/comments/article/:articleId` - Get article comments

- `POST /api/comments` - Create comment (auth required)│   │   ├── lib/              # API client, utils### 3. Frontend Setup

- `DELETE /api/comments/:id` - Delete comment (owner/admin)

│   │   └── App.jsx

### Bookmarks

- `GET /api/bookmarks` - Get user bookmarks (auth required)│   ├── .env.local            # Frontend config```bash

- `POST /api/bookmarks` - Add bookmark (auth required)

- `DELETE /api/bookmarks/:id` - Remove bookmark (auth required)│   └── package.jsoncd ../news-website



### Newsletter│

- `POST /api/newsletter/subscribe` - Subscribe to newsletter

- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter├── package.json              # Root package for running both# Install dependencies



## 🚀 Deployment└── README.md                 # This filenpm install



### Frontend (Vercel)```

```bash

cd apps/frontend# Create .env.local file

npm run build

# Deploy dist/ folder to Vercel## 🔧 Environment Variables```

```



Environment variables for Vercel:

- `VITE_API_URL` - Your backend API URL### Backend (.env)**Configure Frontend `.env.local`:**



### Backend (Render/Railway)```bash

```bash

cd apps/backend# Server```env

# Deploy to Render or Railway

```PORT=5000VITE_API_URL=http://localhost:5000/api



Environment variables:NODE_ENV=developmentVITE_APP_NAME=News Website

- All variables from `.env.example`

- `NODE_ENV=production`VITE_APP_URL=http://localhost:5173

- `FRONTEND_URL` - Your frontend URL

# Database - Choose one:```

## 🛠️ Tech Stack

# Option 1: MongoDB Atlas (Cloud)

### Frontend

- **Framework**: React 19MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/news_website**Start Frontend:**

- **Build Tool**: Vite

- **Styling**: Tailwind CSS

- **Routing**: React Router v6

- **State Management**: Context API# Option 2: Local MongoDB```bash

- **HTTP Client**: Axios

- **SEO**: React Helmet Async# MONGODB_URI=mongodb://localhost:27017/news_websitenpm run dev

- **Icons**: Lucide React

- **Date**: date-fns```



### Backend# JWT Authentication

- **Runtime**: Node.js

- **Framework**: Express.jsJWT_SECRET=your_super_secret_jwt_key_change_this_in_productionFrontend will run on `http://localhost:5173`

- **Database**: MongoDB with Mongoose

- **Authentication**: JWT (jsonwebtoken)JWT_EXPIRE=7d

- **Validation**: express-validator

- **Image Upload**: CloudinaryJWT_REFRESH_SECRET=your_refresh_token_secret_change_this## 🎯 Usage

- **Email**: Nodemailer

- **Security**: Helmet, CORS, express-rate-limitJWT_REFRESH_EXPIRE=30d

- **File Upload**: Multer

### Creating Admin User

## 📝 License

# Cloudinary (Image Uploads) - Already configured for testing

ISC

CLOUDINARY_CLOUD_NAME=dhh2jqj1n1. Register a regular user through the website

## 🤝 Contributing

CLOUDINARY_API_KEY=2474989814583462. Connect to MongoDB and update the user's role:

Contributions are welcome! Please feel free to submit a Pull Request.

CLOUDINARY_API_SECRET=xiMPe_-YJEsd_ScZxhpOqi286hU

## 📧 Support

**MongoDB Shell:**

For support, email your-email@example.com or open an issue on GitHub.

# Email (Optional - for newsletters, welcome emails)```javascript

---

EMAIL_HOST=smtp.gmail.comdb.users.updateOne(

**Built with ❤️ using modern web technologies**

EMAIL_PORT=587  { email: "admin@example.com" },

EMAIL_USER=your_email@gmail.com  { $set: { role: "admin" } }

EMAIL_PASSWORD=your_gmail_app_password)

EMAIL_FROM=noreply@newswebsite.com```



# Frontend URL (for CORS)**MongoDB Compass/Atlas:**

FRONTEND_URL=http://localhost:5173- Find the user in the `users` collection

```- Edit the document and change `role` to `"admin"`



### Frontend (.env.local)### Default Routes

```bash

VITE_API_URL=http://localhost:5000/api**Frontend:**

VITE_APP_NAME=News Website- Home: `http://localhost:5173`

VITE_APP_URL=http://localhost:5173- Login: `http://localhost:5173/login`

```- Register: `http://localhost:5173/signup`

- Admin: `http://localhost:5173/admin`

## 📝 Available Commands

**Backend API:**

```bash- Base: `http://localhost:5000/api`

# Run both backend and frontend together- Health: `http://localhost:5000/api/health`

npm run dev- Docs: See `backend/README.md`



# Run backend only## 📁 Project Structure

npm run dev:backend

```

# Run frontend only├── backend/                 # Node.js/Express Backend

npm run dev:frontend│   ├── src/

│   │   ├── config/         # Database, env, cloudinary

# Install all dependencies│   │   ├── controllers/    # Business logic

npm run install:all│   │   ├── middleware/     # Auth, validation, upload

```│   │   ├── models/         # Mongoose models

│   │   ├── routes/         # API routes

## 🎯 First Time Setup│   │   ├── utils/          # Helper functions

│   │   ├── validators/     # Input validation

### 1. Install Dependencies│   │   ├── app.js          # Express app

```bash│   │   └── index.js        # Server entry

cd /Users/raunak/projects│   ├── .env                # Environment variables

npm install          # Root dependencies│   ├── package.json

cd backend && npm install       # Backend dependencies│   └── README.md

cd ../news-website && npm install  # Frontend dependencies│

```├── news-website/            # React Frontend

│   ├── src/

Or use the shortcut:│   │   ├── components/     # React components

```bash│   │   ├── contexts/       # React contexts

npm run install:all│   │   ├── hooks/          # Custom hooks

```│   │   ├── lib/            # API client, utils

│   │   ├── pages/          # Page components

### 2. Setup MongoDB Atlas (Recommended)│   │   ├── App.jsx         # Main app component

│   │   └── main.jsx        # Entry point

**Why MongoDB Atlas?**│   ├── .env.local          # Environment variables

- ✅ Free forever (M0 tier)│   ├── package.json

- ✅ No installation required│   └── vite.config.js

- ✅ Automatic backups│

- ✅ Access from anywhere└── README.md               # This file

- ✅ Built-in security```



**Steps:**## 🔌 API Endpoints

1. Sign up at https://www.mongodb.com/cloud/atlas/register

2. Create cluster (choose FREE M0 tier)### Authentication

3. Create database user- `POST /api/auth/register` - Register user

4. Whitelist IP address (use `0.0.0.0/0` for development)- `POST /api/auth/login` - Login

5. Get connection string- `GET /api/auth/me` - Get current user

6. Update `backend/.env` with your connection string- `POST /api/auth/logout` - Logout

- `POST /api/auth/forgot-password` - Request password reset

### 3. Configure Cloudinary (Optional)- `POST /api/auth/reset-password/:token` - Reset password



**Current Setup:** Already configured with test account (works out of the box)### Articles

- `GET /api/articles` - Get all articles (paginated)

**For Your Own Account:**- `GET /api/articles/:slug` - Get single article

1. Sign up at https://cloudinary.com (Free tier available)- `POST /api/articles` - Create article (Admin)

2. Get credentials from dashboard- `PUT /api/articles/:id` - Update article (Admin/Author)

3. Update `backend/.env`:- `DELETE /api/articles/:id` - Delete article (Admin)

   ```bash- `GET /api/articles/trending` - Get trending articles

   CLOUDINARY_CLOUD_NAME=your_cloud_name- `GET /api/articles/featured` - Get featured articles

   CLOUDINARY_API_KEY=your_api_key

   CLOUDINARY_API_SECRET=your_api_secret### Categories

   ```- `GET /api/categories` - Get all categories

- `POST /api/categories` - Create category (Admin)

### 4. Run the Project- `PUT /api/categories/:id` - Update category (Admin)

```bash- `DELETE /api/categories/:id` - Delete category (Admin)

npm run dev

```### Tags

- `GET /api/tags` - Get all tags

### 5. Create Admin User- `GET /api/tags/popular` - Get popular tags

- `POST /api/tags` - Create tag (Admin)

**Option A: Via Frontend**

1. Go to http://localhost:5173/signup### Comments

2. Register new account- `GET /api/comments/article/:articleId` - Get article comments

3. Open MongoDB Atlas web interface- `POST /api/comments` - Create comment (Auth)

4. Navigate to your cluster → Browse Collections → news_website → users- `PUT /api/comments/:id` - Update comment (Auth)

5. Find your user and edit: Change `role` from `"user"` to `"admin"`- `DELETE /api/comments/:id` - Delete comment (Auth/Admin)

- `POST /api/comments/:id/like` - Like/unlike comment (Auth)

**Option B: Via API**

```bash### Bookmarks

# Register user- `GET /api/bookmarks` - Get user bookmarks (Auth)

curl -X POST http://localhost:5000/api/auth/register \- `POST /api/bookmarks/:articleId` - Toggle bookmark (Auth)

  -H "Content-Type: application/json" \- `GET /api/bookmarks/check/:articleId` - Check if bookmarked (Auth)

  -d '{

    "email": "admin@example.com",### Newsletter

    "password": "Admin@123",- `POST /api/newsletter/subscribe` - Subscribe

    "username": "admin",- `POST /api/newsletter/unsubscribe` - Unsubscribe

    "full_name": "Admin User"- `GET /api/newsletter/subscribers` - Get subscribers (Admin)

  }'

### Users (Admin)

# Then update role in MongoDB Atlas (see Option A step 4-5)- `GET /api/users` - Get all users

```- `GET /api/users/:id` - Get user by ID

- `PUT /api/users/:id/role` - Update user role

### 6. Access Admin Panel- `DELETE /api/users/:id` - Delete user

1. Login with admin account at http://localhost:5173/login

2. Access admin panel at http://localhost:5173/admin### Site Settings (Admin)

3. Start creating content! 🎉- `GET /api/site-settings` - Get site settings

- `PUT /api/site-settings` - Update site settings

## 🌐 API Endpoints

## 🚀 Deployment

### Authentication

- `POST /api/auth/register` - Register new user### Backend Deployment (Railway/Render/Heroku)

- `POST /api/auth/login` - Login user

- `POST /api/auth/logout` - Logout user1. **Set environment variables** in your hosting platform

- `GET /api/auth/me` - Get current user2. **Connect MongoDB Atlas**

- `POST /api/auth/refresh` - Refresh access token3. **Deploy:**



### Articles**Railway:**

- `GET /api/articles` - Get all articles```bash

- `GET /api/articles/:id` - Get article by IDrailway login

- `GET /api/articles/slug/:slug` - Get article by slugrailway init

- `POST /api/articles` - Create article (admin)railway up

- `PUT /api/articles/:id` - Update article (admin)```

- `DELETE /api/articles/:id` - Delete article (admin)

- `POST /api/articles/:id/views` - Increment views**Render:**

- Connect GitHub repository

### Categories- Set environment variables

- `GET /api/categories` - Get all categories- Deploy

- `GET /api/categories/:id` - Get category by ID

- `POST /api/categories` - Create category (admin)### Frontend Deployment (Vercel/Netlify)

- `PUT /api/categories/:id` - Update category (admin)

- `DELETE /api/categories/:id` - Delete category (admin)1. **Build the frontend:**

```bash

### Tagscd news-website

- `GET /api/tags` - Get all tagsnpm run build

- `GET /api/tags/:id` - Get tag by ID```

- `POST /api/tags` - Create tag (admin)

- `PUT /api/tags/:id` - Update tag (admin)2. **Deploy to Vercel:**

- `DELETE /api/tags/:id` - Delete tag (admin)```bash

npm i -g vercel

### Commentsvercel

- `GET /api/comments/article/:articleId` - Get comments for article```

- `POST /api/comments` - Create comment (authenticated)

- `PUT /api/comments/:id` - Update comment (owner)3. **Or deploy to Netlify:**

- `DELETE /api/comments/:id` - Delete comment (owner/admin)```bash

- `POST /api/comments/:id/like` - Toggle like on commentnpm i -g netlify-cli

netlify deploy --prod

### Bookmarks```

- `GET /api/bookmarks` - Get user's bookmarks

- `POST /api/bookmarks/:articleId` - Toggle bookmark4. **Set environment variables:**

- `VITE_API_URL=https://your-backend-url.com/api`

### Newsletter

- `POST /api/newsletter/subscribe` - Subscribe to newsletter### Database (MongoDB Atlas)



### Site Settings1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

- `GET /api/site-settings` - Get site settings2. Create cluster

- `PUT /api/site-settings` - Update site settings (admin)3. Get connection string

4. Whitelist IP addresses (or allow from anywhere for development)

## 🧪 Testing5. Update `MONGODB_URI` in backend `.env`



### Test Backend API## 🔧 Development

```bash

# Health check### Backend Development

curl http://localhost:5000/api/health

```bash

# Get articlescd backend

curl http://localhost:5000/api/articlesnpm run dev  # Starts with nodemon (auto-restart)

```

# Register user

curl -X POST http://localhost:5000/api/auth/register \### Frontend Development

  -H "Content-Type: application/json" \

  -d '{```bash

    "email": "test@example.com",cd news-website

    "password": "Test@123",npm run dev  # Starts Vite dev server

    "username": "testuser",```

    "full_name": "Test User"

  }'### Running Both Concurrently

```

You can run both backend and frontend simultaneously in different terminal windows or use a tool like `concurrently`:

### Test Frontend

1. Open http://localhost:5173```bash

2. Navigate through pages# In project root

3. Try signing up/logging innpm install -g concurrently

4. Access admin panel (with admin account)

5. Create articles, categories, tags# Create script or run:

6. Upload imagesconcurrently "cd backend && npm run dev" "cd news-website && npm run dev"

7. Post comments```

8. Bookmark articles

## 📝 Environment Variables

## 🔒 Security Features

### Backend (.env)

- JWT-based authentication- `PORT` - Server port (default: 5000)

- Password hashing with bcrypt- `MONGODB_URI` - MongoDB connection string

- Role-based access control (user/admin)- `JWT_SECRET` - JWT token secret

- Rate limiting on API endpoints- `JWT_REFRESH_SECRET` - Refresh token secret

- CORS protection- `CLOUDINARY_*` - Cloudinary credentials

- Input validation and sanitization- `EMAIL_*` - Email service credentials

- XSS protection- `FRONTEND_URL` - Frontend URL for CORS

- File upload validation

- Secure HTTP headers### Frontend (.env.local)

- `VITE_API_URL` - Backend API URL

## 📱 Responsive Design- `VITE_APP_NAME` - App name

- `VITE_APP_URL` - App URL

The website is fully responsive and works perfectly on:

- 📱 Mobile devices (320px+)## 🔒 Security Features

- 📱 Tablets (768px+)

- 💻 Laptops (1024px+)- Password hashing with bcryptjs

- 🖥️ Desktops (1280px+)- JWT authentication with refresh tokens

- Rate limiting

## 🎨 Customization- CORS configuration

- Helmet security headers

### Change Site Name & Branding- Input validation & sanitization

1. Login as admin- NoSQL injection protection

2. Go to Settings → General- XSS protection

3. Update:

   - Site name## 📚 Tech Stack

   - Tagline

   - Description### Frontend

   - Logo- React 19

   - Colors- Vite

- Tailwind CSS

### Modify Theme Colors- Axios

Edit `news-website/tailwind.config.js` to change color scheme.- React Router DOM



### Add Custom Features### Backend

- Backend: Add new routes in `backend/src/routes/`- Node.js

- Frontend: Add new pages in `news-website/src/pages/`- Express.js

- MongoDB

## 🐛 Troubleshooting- Mongoose

- JWT

### "Cannot connect to MongoDB"- Cloudinary

**Solution:** - NodeMailer

- Check MongoDB Atlas cluster is running

- Verify connection string in `backend/.env`## 🐛 Troubleshooting

- Check network access whitelist includes your IP

### MongoDB Connection Issues

### "Port 5000 already in use"- Verify MongoDB is running (local) or connection string is correct (Atlas)

**Solution:**- Check firewall/network settings

```bash- Ensure IP whitelist includes your IP (Atlas)

# Kill process on port 5000

lsof -ti:5000 | xargs kill -9### Cloudinary Upload Errors

- Verify credentials in `.env`

# Or change port in backend/.env- Check file size limits (max 5MB)

PORT=5001- Ensure file is valid image format

```

### Email Not Sending

### "CORS error"- Enable 2FA on Gmail

**Solution:**- Generate App Password

- Ensure `backend/.env` has correct `FRONTEND_URL`- Use App Password in `EMAIL_PASSWORD`

- Restart backend server after changes- Check spam folder



### "Image upload fails"### CORS Errors

**Solution:**- Verify `FRONTEND_URL` in backend `.env`

- Check Cloudinary credentials in `backend/.env`- Check CORS configuration in `backend/src/app.js`

- Verify file size is under 5MB- Ensure frontend is using correct API URL

- Ensure file type is image (jpg, png, webp)

## 📄 License

### Backend won't start

**Solution:**ISC

```bash

cd backend## 👥 Support

rm -rf node_modules package-lock.json

npm installFor issues and questions:

npm run dev- Create an issue in the repository

```- Check existing documentation

- Review API documentation in `backend/README.md`

### Frontend won't start

**Solution:**## 🎉 Contributing

```bash

cd news-website1. Fork the repository

rm -rf node_modules package-lock.json2. Create feature branch (`git checkout -b feature/AmazingFeature`)

npm install3. Commit changes (`git commit -m 'Add AmazingFeature'`)

npm run dev4. Push to branch (`git push origin feature/AmazingFeature`)

```5. Open Pull Request



## 📊 Performance---



- **Backend Response Time:** < 100ms (avg)**Built with ❤️ by Your Team**

- **Frontend Load Time:** < 2s (first load)
- **Hot Reload:** < 500ms (both servers)
- **Image Optimization:** Automatic via Cloudinary
- **API Caching:** Implemented on frequently accessed endpoints

## 🚀 Deployment

### Backend (Node.js API)
Recommended platforms:
- **Render** (Free tier available)
- **Railway** (Free tier available)
- **Heroku**
- **DigitalOcean App Platform**

### Frontend (React App)
Recommended platforms:
- **Vercel** (Free tier, best for Vite)
- **Netlify** (Free tier)
- **Cloudflare Pages** (Free tier)

### Database
- **MongoDB Atlas** (Already cloud-hosted, no deployment needed)

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 💡 Tips

1. **Use MongoDB Atlas** for zero-installation setup
2. **Run `npm run dev`** to start everything with one command
3. **Create admin user first** to access all features
4. **Upload images** directly through admin panel
5. **Dark mode** available in theme settings
6. **Newsletter** works without email config (stores in DB)

## 📞 Support

For issues or questions:
1. Check this README
2. Review error messages in terminal
3. Check browser console for frontend errors
4. Verify environment variables are set correctly

## 🎉 You're All Set!

```bash
# Just run this command and start building:
npm run dev
```

**Then open:** http://localhost:5173

Happy coding! 🚀
