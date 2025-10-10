# 🚀 NewsHub - Modern News Website# 🚀 NewsHub - Modern News Website



A **production-ready** news website built with **React 19** and **Supabase**. Features complete authentication, article management, admin panel with 80+ dynamic content fields, comments, bookmarks, and a stunning modern UI with dark mode.A **fully functional, production-ready** news website built with **React 19** and **Supabase**. Features include complete authentication, article management with rich media, real-time comments, social interactions, admin panel, dynamic site configuration, and a stunning modern UI with light/dark mode that works perfectly on all devices.



---## 🎯 Quick Start



## ⚡ Quick Start### Prerequisites

- Node.js 18+ installed

### Prerequisites- Supabase account (free tier works)

- Node.js 18+

- Supabase account ([free tier](https://supabase.com))### Installation



### 1. Install Dependencies1. **Clone and Install**

```bash```bash

git clone <your-repo-url>git clone <repository-url>

cd news-websitecd news-website

npm installnpm install

``````



### 2. Setup Database2. **Setup Supabase Database**

1. Create a new project at [Supabase Dashboard](https://supabase.com/dashboard)   - Go to [Supabase Dashboard](https://supabase.com/dashboard)

2. Go to **SQL Editor**   - Create a new project

3. Open `supabase-schema.sql` from this project   - Go to **SQL Editor**

4. Copy the **entire file** and paste into SQL Editor   - Open `master_supabase_schema.sql` (single consolidated schema file)

5. Click **Run** ▶️   - Copy the entire file and paste into SQL Editor

6. Wait for success message (creates tables, policies, storage, seed data)   - Click **Run** to create all tables, policies, storage buckets, and seed data



### 3. Configure Environment3. **Environment Setup**

Create `.env` file in the root:   - Copy `.env.example` to `.env`

```env   - Add your Supabase credentials:

VITE_SUPABASE_URL=https://your-project-id.supabase.co```env

VITE_SUPABASE_ANON_KEY=your-anon-key-hereVITE_SUPABASE_URL=your_project_url

```VITE_SUPABASE_ANON_KEY=your_anon_key

```

Get these values from: Supabase Dashboard → Project Settings → API

4. **Run Development Server**

### 4. Start Development Server```bash

```bashnpm run dev

npm run dev```

```

Visit `http://localhost:5173` to see the app!

Visit: `http://localhost:5173`

## ✨ Live Features

---

### 🔐 Authentication & User Management ✅

## 🎯 Key Features- **Sign Up/Sign In**: Full email & password authentication with session management

- **Password Management**: Reset and forgot password functionality via email

### 🔐 Authentication- **User Profiles**: View, edit, avatar upload with Supabase Storage

- Email/password signup & login- **Session Management**: Automatic refresh and persistence across browser sessions

- Password reset via email- **Role-Based Access**: User, Editor, and Admin roles with different permissions

- User profiles with avatars

- Role-based access (User, Editor, Admin)### 📝 Article Management ✅

- Session persistence- **Create Articles**: Rich text editor with images, videos, categories, and tags

- **Edit Articles**: Author-only editing with automatic slug updates

### 📰 Article Management- **Delete Articles**: Confirmation modals with cascade deletion

- Rich text editor for content- **Article Discovery**: Home grid, real-time search, category filters, trending sidebar

- Image upload & management- **View Articles**: Full detail pages with author info, stats, and embedded media

- Categories & tags

- Draft/Published/Archived states### 💬 Real-time Comment System ✅

- Featured articles- **Live Comments**: Instant updates without page refresh using Supabase subscriptions

- View counter- **Nested Replies**: Full threaded comment system with unlimited nesting

- SEO-friendly slugs- **Edit/Delete**: Users can manage their own comments

- **User Attribution**: Avatars, usernames, and relative timestamps ("5m ago")

### 💬 Social Features- **Optimistic UI**: Instant feedback before server confirmation

- Nested comments with replies

- Article bookmarks### ❤️ Social Features ✅

- Like/reaction system- **Likes**: Like/unlike articles with real-time counters and state management

- User profiles- **Bookmarks**: Save articles with dedicated bookmarks page

- Social sharing- **Share**: Share buttons ready for social media integration



### 🎨 Admin Panel (8 Tabs)### 🎨 Modern UI/UX ✅

Navigate to `/admin` after creating an admin account:- **Theme System**: Light/Dark mode with system detection and smooth transitions

- **Responsive Design**: Mobile-first, fully optimized for all devices

1. **Dashboard** - Analytics & statistics- **Navigation**: Sticky header with user menu, comprehensive footer, trending sidebar

2. **Articles** - Manage all articles- **UI Components**: Beautiful reusable components (Buttons, Inputs, Cards, Modals, Dropdowns)

3. **Categories** - Organize content- **Custom Styling**: Glassmorphism effects, gradients, smooth animations

4. **Tags** - Tag management- **Loading States**: Skeleton screens, spinners, and optimistic updates

5. **Comments** - Moderate discussions- **Error Handling**: User-friendly error messages with retry functionality

6. **Users** - User management

7. **Settings** - 80+ dynamic content fields:### 🔔 Real-time Features ✅

   - Site identity (name, logo, tagline)- **Live Comments**: Comments appear instantly across all clients

   - SEO settings- **Live Likes**: Like counts update in real-time for all users

   - Contact information- **Live Bookmarks**: Bookmark changes sync across sessions

   - Social media links- **Optimistic Updates**: Immediate UI feedback for better UX

   - Legal content (privacy, terms)

   - Company info (mission, vision, values)### 🔍 Search & Discovery ✅

   - About Us content- **Keyword Search**: Real-time filtering by title and excerpt

   - Feature toggles (RSS, newsletter, comments)- **Categories**: Organized content by topics with color-coded badges

   - Theme customization- **Tags**: Additional content labeling and filtering

   - And much more!- **Trending**: Most viewed articles in sidebar widget



### 🎨 User Experience### 🛡️ Admin Panel ✅

- **Responsive Design** - Works on all devices- **AdminRoute Protection**: Role-based access control with redirect

- **Dark Mode** - System-aware theme switching- **Admin Dashboard**: Stats overview, recent articles, users management

- **Fast Performance** - Optimized with Vite- **User Management**: Toggle admin/user roles with instant updates

- **Modern UI** - Tailwind CSS with beautiful components- **Article Management**: View all articles table with full CRUD operations

- **Loading States** - Skeleton screens for better UX- **Category & Tag Management**: Manage content organization

- **Error Handling** - Clear error messages- **Comment Moderation**: Approve/delete comments

- **Settings Panel**: Complete site configuration (see below)

### 📄 Dynamic Pages- **Admin Layout**: Collapsible sidebar with intuitive navigation

All content is managed from the admin panel:

- Home page### ⚙️ Site Configuration System ✅

- About Us- **Dynamic Site Identity**: Change site name, logo, tagline without code

- Contact- **SEO Management**: Meta titles, descriptions, keywords, Open Graph images

- Privacy Policy- **Social Media Integration**: Facebook, Twitter, Instagram, LinkedIn, YouTube, GitHub URLs

- Terms of Service- **Contact Information**: Email, phone, address displayed dynamically

- RSS Feed (toggleable)- **Advanced Settings**: 

- Footer links  - Google Analytics integration

- Header navigation  - Newsletter toggle (enable/disable site-wide)

  - Comments toggle (enable/disable globally)

---  - Custom CSS injection

  - Custom JavaScript injection

## 🏗️ Tech Stack- **Real-time Updates**: Changes appear instantly across all open tabs

- **Image Uploads**: Logo and OG image upload with validation

- **Frontend**: React 19, React Router 7, Tailwind CSS

- **Backend**: Supabase (PostgreSQL + Auth + Storage)### 📱 Mobile & Responsive Design ✅

- **Rich Text**: React Quill- **Mobile-First Approach**: Optimized for smallest screens first

- **Icons**: Heroicons- **Responsive Breakpoints**: 

- **Build Tool**: Vite  - Mobile: Default (320px+)

- **Hosting Ready**: Deploy to Vercel, Netlify, or any static host  - Tablet: md: (768px+)

  - Desktop: lg: (1024px+)

---- **Touch-Optimized**: 44x44px minimum touch targets

- **Hamburger Menu**: Smooth slide-down navigation

## 📁 Project Structure- **Mobile Search**: Collapsible search bar

- **Responsive Grids**: 1/2/3 column layouts based on screen size

```- **Horizontal Scroll Tables**: Admin tables scroll on mobile

news-website/- **Flexible Layouts**: All forms and content adapt to screen size

├── src/- **No Horizontal Overflow**: Proper container constraints

│   ├── components/          # Reusable UI components

│   │   ├── layout/         # Header, Footer, Sidebar### 🌙 Dark Mode Implementation ✅

│   │   └── ui/             # Button, Card, Input, etc.- **System Detection**: Respects user's OS theme preference

│   ├── contexts/            # React contexts- **Manual Toggle**: Theme switcher in header

│   │   ├── AuthContext.jsx        # Authentication state- **Persistent Choice**: Saved to localStorage

│   │   ├── SiteSettingsContext.jsx # Dynamic content- **Complete Coverage**: All components support dark mode

│   │   └── ThemeContext.jsx       # Dark mode- **Proper Contrast**: WCAG AA compliant color ratios

│   ├── pages/              # Route pages- **Smooth Transitions**: Animated theme switching

│   │   ├── admin/          # Admin panel pages

│   │   ├── auth/           # Login, signup, profile### 🔒 Security & Performance ✅

│   │   ├── Home.jsx- **Row Level Security (RLS)**: Supabase policies enforced on all tables

│   │   ├── ArticleDetail.jsx- **Authentication Security**: Password hashing, secure sessions, email verification

│   │   ├── AboutUs.jsx- **Data Validation**: Client-side and database constraints

│   │   ├── Contact.jsx- **File Upload Limits**: 2MB avatars, 5MB article images

│   │   ├── PrivacyPolicy.jsx- **CSS Code Splitting**: Optimized bundle sizes

│   │   └── TermsOfService.jsx- **Lazy Loading**: Images and components loaded on demand

│   ├── lib/- **Efficient Queries**: Indexed database operations with proper joins

│   │   └── supabase.js     # Supabase client

│   └── App.jsx             # Main app with routing---

├── public/                  # Static assets

├── supabase-schema.sql     # 🎯 Single source of truth for DB## 🛠️ Tech Stack

├── .env                     # Environment variables (create this)

├── package.json### Frontend

└── README.md```

```React 19.1.1

├── Routing: React Router DOM 7.9.3

---├── Styling: Tailwind CSS 3.4.1

├── Icons: Heroicons 2.2.0

## 🚀 Deployment├── UI Components: Headless UI 2.2.9

└── Build: Vite 7.1.7

### Build for Production```

```bash

npm run build### Backend

``````

Supabase

### Deploy to Vercel├── Database: PostgreSQL with Row Level Security

```bash├── Authentication: Supabase Auth with email verification

npm install -g vercel├── Storage: File uploads (avatars, article images)

vercel├── Real-time: Live subscriptions for comments, likes, bookmarks

```└── API: @supabase/supabase-js 2.74.0

```

### Deploy to Netlify

1. Build: `npm run build`---

2. Publish directory: `dist`

3. Add environment variables in Netlify dashboard## 📋 Prerequisites



### Environment Variables- **Node.js** 18+ and npm

Make sure to set these in your hosting platform:- **Supabase account** ([sign up free](https://supabase.com))

- `VITE_SUPABASE_URL`- Basic knowledge of React and SQL

- `VITE_SUPABASE_ANON_KEY`

---

---

## 🚀 Quick Start

## 👤 Creating Your First Admin Account

### 1. Clone the Repository

1. Start the app: `npm run dev`

2. Click "Sign Up" and create an account```bash

3. Go to Supabase Dashboard → Table Editor → `profiles` tablegit clone <your-repo-url>

4. Find your user rowcd news-website

5. Change `role` from `user` to `admin`cd news-website

6. Refresh the app```

7. Navigate to `/admin` - you now have full access!

### 2. Install Dependencies

---

```bash

## 🔧 Common Tasksnpm install

```

### Update Site Settings

1. Login as admin### 3. Set Up Supabase

2. Go to `/admin`

3. Click "Settings" tab1. Create a new project at [supabase.com](https://supabase.com)

4. Update any of the 80+ fields2. Go to the SQL Editor in your Supabase dashboard

5. Click "Save Settings"3. Copy and paste all SQL commands from `SUPABASE_SCHEMA.md` to create:

6. Changes appear instantly across the site   - Tables (profiles, articles, categories, comments, likes, bookmarks)

   - Row Level Security policies

### Create a New Article   - Storage buckets

1. Go to `/admin/articles`   - Functions and triggers

2. Click "Create New Article"   - Real-time subscriptions

3. Fill in title, content, category

4. Upload featured image### 4. Configure Environment Variables

5. Add tags

6. Click "Publish" or "Save as Draft"1. Copy `.env.example` to `.env`:

   ```bash

### Manage Users   cp .env.example .env

1. Go to `/admin/users`   ```

2. View all registered users

3. Change roles or deactivate accounts2. Fill in your Supabase credentials:

   ```env

### Moderate Comments   VITE_SUPABASE_URL=your_supabase_project_url

1. Go to `/admin/comments`   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

2. Approve/reject/delete comments   ```

3. View by article or user

   You can find these values in your Supabase project settings under **API**.

---

### 5. Run the Development Server

## 🛠️ Customization

```bash

### Change Theme Colorsnpm run dev

Go to Admin → Settings → Appearance tab:```

- Primary color

- Secondary colorThe app will be available at `http://localhost:5173`

- Font family

## Project Structure

Or edit `tailwind.config.js` directly.

```

### Add New Categoriesnews-website/

Admin → Categories → "Create New Category"├── public/                 # Static assets

├── src/

### Configure Social Media│   ├── components/        # Reusable components

Admin → Settings → Social Media tab → Add your profile URLs│   │   ├── layout/       # Header, Footer, Sidebar

│   │   └── ui/           # Button, Input, Card, Loading, etc.

### Update Legal Pages│   ├── contexts/         # React Context providers

Admin → Settings → Legal Information tab:│   │   ├── AuthContext.jsx

- Privacy Policy last updated│   │   └── ThemeContext.jsx

- Terms of Service last updated│   ├── lib/              # Utilities and configurations

- Legal jurisdiction│   │   └── supabase.js   # Supabase client setup

- DPO information│   ├── pages/            # Page components

│   │   ├── auth/        # Login, Signup, Profile, etc.

---│   │   ├── Home.jsx

│   │   └── ...

## 📊 Database Schema│   ├── App.jsx           # Main app component with routing

│   ├── App.css

The `supabase-schema.sql` file contains:│   ├── index.css         # Global styles and CSS variables

- ✅ 12 tables (profiles, articles, categories, tags, comments, etc.)│   └── main.jsx          # App entry point

- ✅ 80+ site_settings columns for dynamic content├── .env.example          # Environment variables template

- ✅ Row Level Security (RLS) policies for public access├── SUPABASE_SCHEMA.md    # Complete database schema

- ✅ Storage buckets (avatars, articles, site-assets)└── README.md             # This file

- ✅ Indexes for performance```

- ✅ Triggers for auto-updating timestamps

- ✅ Functions for view counting## Key Components

- ✅ Seed data (default categories, tags, settings)

### Contexts

---

- **AuthContext**: Manages user authentication, profile, and auth-related operations

## 🐛 Troubleshooting- **ThemeContext**: Handles light/dark mode toggle with localStorage persistence



### "Invalid API Key" Error### Layout Components

- Check your `.env` file has correct Supabase credentials

- Restart dev server after changing `.env`- **Header**: Navigation, search, theme toggle, user menu

- **Footer**: Links, categories, social media

### "Failed to Fetch" Error- **Sidebar**: Trending articles, newsletter signup, categories

- Verify Supabase project is active

- Check RLS policies are enabled (run schema file)### UI Components



### Images Not Uploading- **Button**: Multiple variants (primary, secondary, outline, ghost, danger)

- Check storage buckets exist in Supabase- **Input**: Form inputs with validation and error states

- Verify storage policies in SQL Editor- **Card**: Container component with elevation and hover effects

- **Loading**: Loading spinner with optional full-screen mode

### Articles Not Showing- **ErrorMessage**: Error display with retry functionality

- Make sure article status is "published"

- Check published_at date is in the past## Available Scripts



### Can't Access Admin Panel```bash

- Verify your user role is "admin" in `profiles` table# Development server

- Logout and login againnpm run dev



---# Build for production

npm run build

## 📝 License

# Preview production build

MIT License - feel free to use this for your own projects!npm run preview



---# Lint code

npm run lint

## 🙏 Support```



If you encounter issues:## Database Schema

1. Check the Troubleshooting section above

2. Verify your Supabase schema is set up correctlySee `SUPABASE_SCHEMA.md` for the complete database schema including:

3. Check browser console for detailed error messages- Table structures

4. Ensure all environment variables are set- Row Level Security policies

- Storage bucket configurations

---- Functions and triggers

- Real-time setup instructions

## 🎉 You're All Set!

## Authentication Flow

Your modern news website is ready to go. Start by:

1. ✅ Creating your admin account1. **Sign Up**: Users create an account with email/password and username

2. ✅ Configuring site settings in the admin panel2. **Email Verification**: Supabase sends a verification email

3. ✅ Adding some categories3. **Profile Creation**: A trigger automatically creates a profile entry

4. ✅ Creating your first article4. **Sign In**: Users log in with email/password

5. ✅ Customizing the theme and branding5. **Session Management**: Supabase handles sessions with automatic refresh

6. **Password Reset**: Users can reset forgotten passwords via email

Happy publishing! 🚀📰

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
