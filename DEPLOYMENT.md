# 🚀 Deploying to Vercel

## Quick Deployment Steps

### 1. Push Code to GitHub ✅
Your code is already pushed to GitHub: `Rau238/policydrift-news`

### 2. Deploy on Vercel

#### Option A: Using Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. Click **"Add New Project"**
4. **Import** your repository: `Rau238/policydrift-news`
5. Vercel will auto-detect it's a **Vite** project
6. **Configure Environment Variables**:
   - Click on "Environment Variables"
   - Add the following:
   
   ```
   VITE_SUPABASE_URL=https://xlqnlydxqlbhjdghpryx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhscW5seWR4cWxiaGpkZ2hwcnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzQyMTUsImV4cCI6MjA3NTM1MDIxNX0.i-WDiHtsUhTikwyevY7SlRzwINJWONlQcDBpFSFNNGg
   ```
   
7. Click **"Deploy"**
8. Wait 2-3 minutes for deployment to complete ⏳
9. Your site will be live at: `your-project.vercel.app` 🎉

#### Option B: Using Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:
   ```bash
   cd /Users/raunak/projects/news-website
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set up environment variables when prompted
   
5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### 3. Configure Supabase (Important!)

After deployment, you need to add your Vercel domain to Supabase:

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: `xlqnlydxqlbhjdghpryx`
3. Go to **Authentication** → **URL Configuration**
4. Add your Vercel URL to **Site URL** and **Redirect URLs**:
   ```
   https://your-project.vercel.app
   ```

### 4. Custom Domain (Optional)

1. In Vercel Dashboard → **Settings** → **Domains**
2. Add your custom domain (e.g., `policydrift.com`)
3. Update DNS records as instructed by Vercel
4. Update Supabase redirect URLs with your custom domain

## Environment Variables Needed

Make sure to add these in Vercel Dashboard:

| Variable Name | Value |
|---------------|-------|
| `VITE_SUPABASE_URL` | `https://xlqnlydxqlbhjdghpryx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key |

⚠️ **Note**: Never commit `.env` file to GitHub for security!

## Automatic Deployments

Once connected to Vercel:
- Every push to `main` branch = automatic production deployment 🚀
- Every pull request = automatic preview deployment 🔍

## Troubleshooting

### Build Fails
- Check if all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs in Vercel dashboard

### Environment Variables Not Working
- Make sure variable names start with `VITE_`
- Redeploy after adding environment variables

### Supabase Connection Issues
- Verify Supabase URL is added to allowed domains
- Check if API keys are correct
- Ensure RLS policies are set up correctly

## Useful Commands

```bash
# Local preview of production build
npm run build
npm run preview

# Deploy to Vercel (if using CLI)
vercel --prod

# View deployment logs
vercel logs
```

## Your Project Details

- **GitHub**: https://github.com/Rau238/policydrift-news
- **Supabase Project**: xlqnlydxqlbhjdghpryx
- **Framework**: Vite + React
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)

## Next Steps After Deployment

1. ✅ Test all features on production
2. ✅ Configure custom domain
3. ✅ Set up analytics (Vercel Analytics)
4. ✅ Enable Vercel Speed Insights
5. ✅ Set up monitoring and alerts
6. ✅ Configure CDN and caching

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
