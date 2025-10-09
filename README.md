# 🚀 NewsHub - Modern News Website

A **fully functional, production-ready** news website built with **React 19** and **Supabase**. Features include complete authentication, article management with rich media, real-time comments, social interactions, admin panel, dynamic site configuration, and a stunning modern UI with light/dark mode that works perfectly on all devices.

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)

### Installation

1. **Clone and Install**
```bash
git clone <repository-url>
cd news-website
npm install
```

2. **Setup Supabase Database**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create a new project
   - Go to **SQL Editor**
   - Open `master_supabase_schema.sql` (single consolidated schema file)
   - Copy the entire file and paste into SQL Editor
   - Click **Run** to create all tables, policies, storage buckets, and seed data

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

4. **Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:5173` to see the app!

## ✨ Live Features

### 🔐 Authentication & User Management ✅
- **Sign Up/Sign In**: Full email & password authentication with session management
- **Password Management**: Reset and forgot password functionality via email
- **User Profiles**: View, edit, avatar upload with Supabase Storage
- **Session Management**: Automatic refresh and persistence across browser sessions
- **Role-Based Access**: User, Editor, and Admin roles with different permissions

### 📝 Article Management ✅
- **Create Articles**: Rich text editor with images, videos, categories, and tags
- **Edit Articles**: Author-only editing with automatic slug updates
- **Delete Articles**: Confirmation modals with cascade deletion
- **Article Discovery**: Home grid, real-time search, category filters, trending sidebar
- **View Articles**: Full detail pages with author info, stats, and embedded media

### 💬 Real-time Comment System ✅
- **Live Comments**: Instant updates without page refresh using Supabase subscriptions
- **Nested Replies**: Full threaded comment system with unlimited nesting
- **Edit/Delete**: Users can manage their own comments
- **User Attribution**: Avatars, usernames, and relative timestamps ("5m ago")
- **Optimistic UI**: Instant feedback before server confirmation

### ❤️ Social Features ✅
- **Likes**: Like/unlike articles with real-time counters and state management
- **Bookmarks**: Save articles with dedicated bookmarks page
- **Share**: Share buttons ready for social media integration

### 🎨 Modern UI/UX ✅
- **Theme System**: Light/Dark mode with system detection and smooth transitions
- **Responsive Design**: Mobile-first, fully optimized for all devices
- **Navigation**: Sticky header with user menu, comprehensive footer, trending sidebar
- **UI Components**: Beautiful reusable components (Buttons, Inputs, Cards, Modals, Dropdowns)
- **Custom Styling**: Glassmorphism effects, gradients, smooth animations
- **Loading States**: Skeleton screens, spinners, and optimistic updates
- **Error Handling**: User-friendly error messages with retry functionality

### 🔔 Real-time Features ✅
- **Live Comments**: Comments appear instantly across all clients
- **Live Likes**: Like counts update in real-time for all users
- **Live Bookmarks**: Bookmark changes sync across sessions
- **Optimistic Updates**: Immediate UI feedback for better UX

### 🔍 Search & Discovery ✅
- **Keyword Search**: Real-time filtering by title and excerpt
- **Categories**: Organized content by topics with color-coded badges
- **Tags**: Additional content labeling and filtering
- **Trending**: Most viewed articles in sidebar widget

### 🛡️ Admin Panel ✅
- **AdminRoute Protection**: Role-based access control with redirect
- **Admin Dashboard**: Stats overview, recent articles, users management
- **User Management**: Toggle admin/user roles with instant updates
- **Article Management**: View all articles table with full CRUD operations
- **Category & Tag Management**: Manage content organization
- **Comment Moderation**: Approve/delete comments
- **Settings Panel**: Complete site configuration (see below)
- **Admin Layout**: Collapsible sidebar with intuitive navigation

### ⚙️ Site Configuration System ✅
- **Dynamic Site Identity**: Change site name, logo, tagline without code
- **SEO Management**: Meta titles, descriptions, keywords, Open Graph images
- **Social Media Integration**: Facebook, Twitter, Instagram, LinkedIn, YouTube, GitHub URLs
- **Contact Information**: Email, phone, address displayed dynamically
- **Advanced Settings**: 
  - Google Analytics integration
  - Newsletter toggle (enable/disable site-wide)
  - Comments toggle (enable/disable globally)
  - Custom CSS injection
  - Custom JavaScript injection
- **Real-time Updates**: Changes appear instantly across all open tabs
- **Image Uploads**: Logo and OG image upload with validation

### 📱 Mobile & Responsive Design ✅
- **Mobile-First Approach**: Optimized for smallest screens first
- **Responsive Breakpoints**: 
  - Mobile: Default (320px+)
  - Tablet: md: (768px+)
  - Desktop: lg: (1024px+)
- **Touch-Optimized**: 44x44px minimum touch targets
- **Hamburger Menu**: Smooth slide-down navigation
- **Mobile Search**: Collapsible search bar
- **Responsive Grids**: 1/2/3 column layouts based on screen size
- **Horizontal Scroll Tables**: Admin tables scroll on mobile
- **Flexible Layouts**: All forms and content adapt to screen size
- **No Horizontal Overflow**: Proper container constraints

### 🌙 Dark Mode Implementation ✅
- **System Detection**: Respects user's OS theme preference
- **Manual Toggle**: Theme switcher in header
- **Persistent Choice**: Saved to localStorage
- **Complete Coverage**: All components support dark mode
- **Proper Contrast**: WCAG AA compliant color ratios
- **Smooth Transitions**: Animated theme switching

### 🔒 Security & Performance ✅
- **Row Level Security (RLS)**: Supabase policies enforced on all tables
- **Authentication Security**: Password hashing, secure sessions, email verification
- **Data Validation**: Client-side and database constraints
- **File Upload Limits**: 2MB avatars, 5MB article images
- **CSS Code Splitting**: Optimized bundle sizes
- **Lazy Loading**: Images and components loaded on demand
- **Efficient Queries**: Indexed database operations with proper joins

---

## 🛠️ Tech Stack

### Frontend
```
React 19.1.1
├── Routing: React Router DOM 7.9.3
├── Styling: Tailwind CSS 3.4.1
├── Icons: Heroicons 2.2.0
├── UI Components: Headless UI 2.2.9
└── Build: Vite 7.1.7
```

### Backend
```
Supabase
├── Database: PostgreSQL with Row Level Security
├── Authentication: Supabase Auth with email verification
├── Storage: File uploads (avatars, article images)
├── Real-time: Live subscriptions for comments, likes, bookmarks
└── API: @supabase/supabase-js 2.74.0
```

---

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Supabase account** ([sign up free](https://supabase.com))
- Basic knowledge of React and SQL

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd news-website
cd news-website
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste all SQL commands from `SUPABASE_SCHEMA.md` to create:
   - Tables (profiles, articles, categories, comments, likes, bookmarks)
   - Row Level Security policies
   - Storage buckets
   - Functions and triggers
   - Real-time subscriptions

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can find these values in your Supabase project settings under **API**.

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
news-website/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── layout/       # Header, Footer, Sidebar
│   │   └── ui/           # Button, Input, Card, Loading, etc.
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── lib/              # Utilities and configurations
│   │   └── supabase.js   # Supabase client setup
│   ├── pages/            # Page components
│   │   ├── auth/        # Login, Signup, Profile, etc.
│   │   ├── Home.jsx
│   │   └── ...
│   ├── App.jsx           # Main app component with routing
│   ├── App.css
│   ├── index.css         # Global styles and CSS variables
│   └── main.jsx          # App entry point
├── .env.example          # Environment variables template
├── SUPABASE_SCHEMA.md    # Complete database schema
└── README.md             # This file
```

## Key Components

### Contexts

- **AuthContext**: Manages user authentication, profile, and auth-related operations
- **ThemeContext**: Handles light/dark mode toggle with localStorage persistence

### Layout Components

- **Header**: Navigation, search, theme toggle, user menu
- **Footer**: Links, categories, social media
- **Sidebar**: Trending articles, newsletter signup, categories

### UI Components

- **Button**: Multiple variants (primary, secondary, outline, ghost, danger)
- **Input**: Form inputs with validation and error states
- **Card**: Container component with elevation and hover effects
- **Loading**: Loading spinner with optional full-screen mode
- **ErrorMessage**: Error display with retry functionality

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Database Schema

See `SUPABASE_SCHEMA.md` for the complete database schema including:
- Table structures
- Row Level Security policies
- Storage bucket configurations
- Functions and triggers
- Real-time setup instructions

## Authentication Flow

1. **Sign Up**: Users create an account with email/password and username
2. **Email Verification**: Supabase sends a verification email
3. **Profile Creation**: A trigger automatically creates a profile entry
4. **Sign In**: Users log in with email/password
5. **Session Management**: Supabase handles sessions with automatic refresh
6. **Password Reset**: Users can reset forgotten passwords via email

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard

### Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy`
3. Add environment variables in Netlify dashboard

### Supabase Static Hosting

Follow the guide in the [Supabase docs](https://supabase.com/docs/guides/hosting/overview)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

⚠️ **Important**: Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

## Security Considerations

- Row Level Security (RLS) is enabled on all tables
- Authenticated users can only modify their own content
- Storage buckets have appropriate policies
- Environment variables are properly scoped with `VITE_` prefix
- User inputs are validated on the client and database level

## Performance Optimizations

- Lazy loading for images
- Code splitting with React.lazy (can be added for routes)
- Optimistic UI updates for better perceived performance
- Efficient database queries with proper indexes
- Real-time subscriptions only where needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

**1. "Missing Supabase environment variables"**
- Make sure you've created a `.env` file with correct credentials
- Restart the dev server after adding environment variables

**2. Database/Auth errors**
- Verify you've run all SQL commands from `SUPABASE_SCHEMA.md`
- Check that RLS policies are correctly set up
- Ensure storage buckets are created

**3. Images not uploading**
- Verify storage buckets exist in Supabase
- Check storage policies allow authenticated users to upload
- Ensure file size is under the limit (default: 2MB for avatars)

**4. Real-time features not working**
- Ensure tables are added to the `supabase_realtime` publication
- Check that real-time is enabled in your Supabase project settings

## Next Steps / Enhancements

The core features are complete! Additional enhancements you can add:

- [ ] Category pages with filtered articles
- [ ] User dashboard showing authored articles
- [ ] Admin panel for content moderation
- [ ] Newsletter subscription with email integration
- [ ] SEO optimization with React Helmet
- [ ] Social media share functionality
- [ ] Trending topics algorithm
- [ ] Article recommendations based on reading history
- [ ] Email notifications for new comments
- [ ] Rich text editor (e.g., TipTap, Quill)
- [ ] Image optimization and lazy loading
- [ ] Infinite scroll pagination
- [ ] Advanced search with filters

## Completed Features

All major features have been implemented:

✅ User authentication (signup, login, password reset)  
✅ Profile management with avatar upload  
✅ Article CRUD operations  
✅ Article detail page with full content  
✅ Create/Edit article with image upload  
✅ Real-time comment system  
✅ Nested comment replies  
✅ Like and bookmark articles  
✅ Bookmarks page  
✅ Real-time subscriptions  
✅ Dark/light mode toggle  
✅ Responsive mobile-first design  
✅ Search functionality  
✅ Trending articles sidebar  

## Support

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [React Documentation](https://react.dev)
- Open an issue in this repository

---

Built with ❤️ using React and Supabase
# policydrift-news
