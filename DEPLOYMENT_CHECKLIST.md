# Deployment Checklist ✅

Follow these steps to get your app live on Vercel.

## Pre-Deployment (Local Setup)

### 1. Get Mapbox Token
- [ ] Go to https://account.mapbox.com/
- [ ] Sign up (free account)
- [ ] Copy your default public token
- [ ] Update `.env` file with your token:
  ```
  VITE_MAPBOX_TOKEN=pk.your_actual_token_here
  ```

### 2. Test Locally
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:5173
- [ ] Verify map loads correctly
- [ ] Test toggling routes
- [ ] Test clicking routes/stops
- [ ] Test trip planner
- [ ] Test on mobile view (responsive design)

### 3. Build Test
- [ ] Run `npm run build`
- [ ] Verify build completes without errors
- [ ] Run `npm run preview`
- [ ] Test the production build locally

## GitHub Setup

### 4. Create Repository
- [ ] Go to https://github.com/new
- [ ] Repository name: `monterey-transit-explorer` (or your choice)
- [ ] Keep it public (or private if preferred)
- [ ] Don't initialize with README (we have one)
- [ ] Click "Create repository"

### 5. Push Code
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Monterey Transit Explorer MVP"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/monterey-transit-explorer.git

# Push
git branch -M main
git push -u origin main
```

- [ ] Verify code is on GitHub
- [ ] Check all files uploaded correctly

## Vercel Deployment

### 6. Deploy to Vercel

#### Option A: Via Dashboard (Easiest)
- [ ] Go to https://vercel.com
- [ ] Sign up/login (can use GitHub account)
- [ ] Click "Add New Project"
- [ ] Import your GitHub repository
- [ ] Configure:
  - **Framework Preset**: Vite (auto-detected)
  - **Build Command**: `npm run build` (auto-detected)
  - **Output Directory**: `dist` (auto-detected)
- [ ] Click "Environment Variables"
- [ ] Add variable:
  - Name: `VITE_MAPBOX_TOKEN`
  - Value: `[paste your Mapbox token]`
- [ ] Click "Deploy"

#### Option B: Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# When prompted, answer:
# - Set up and deploy? Y
# - Link to existing project? N
# - Project name? monterey-transit-explorer
# - Directory? ./
# - Override settings? N
# - Add environment variables? Y
#   - Name: VITE_MAPBOX_TOKEN
#   - Value: [your token]
```

- [ ] Deployment successful
- [ ] Note your deployment URL

### 7. Test Production Site
- [ ] Open your Vercel URL (e.g., https://monterey-transit-explorer.vercel.app)
- [ ] Verify map loads
- [ ] Test all features:
  - [ ] Routes display
  - [ ] Stops display
  - [ ] Click interactions
  - [ ] Search functionality
  - [ ] Trip planner
  - [ ] Mobile responsive
- [ ] Check browser console for errors
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile device

### 8. Custom Domain (Optional)
- [ ] Go to Vercel dashboard → Your project → Settings → Domains
- [ ] Add custom domain if you have one
- [ ] Follow DNS configuration instructions

## Post-Deployment

### 9. Documentation
- [ ] Update README.md with live URL
- [ ] Share link with stakeholders
- [ ] Document any issues found

### 10. Monitoring
- [ ] Check Vercel Analytics (free tier)
- [ ] Monitor for errors in Vercel dashboard
- [ ] Test after a few hours to ensure stability

## Troubleshooting

### Map Not Loading
- ✅ Check Mapbox token is correct
- ✅ Verify environment variable name: `VITE_MAPBOX_TOKEN`
- ✅ Check browser console for errors
- ✅ Ensure token has no extra spaces

### Build Fails
- ✅ Run `npm run build` locally first
- ✅ Check for TypeScript errors
- ✅ Verify all dependencies in package.json
- ✅ Check Vercel build logs

### Routes/Stops Not Showing
- ✅ Verify data files exist in `/data`
- ✅ Check GeoJSON format is valid
- ✅ Look for fetch errors in browser console

### Environment Variable Not Working
- ✅ Ensure variable starts with `VITE_`
- ✅ Redeploy after adding variables
- ✅ Check variable is in Production environment

## Quick Commands Reference

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls
```

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Mapbox Docs**: https://docs.mapbox.com/
- **React Docs**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs

## Success Criteria

Your deployment is successful when:
- ✅ Site loads without errors
- ✅ Map displays with routes and stops
- ✅ All interactive features work
- ✅ Mobile responsive
- ✅ Fast load time (<3 seconds)
- ✅ No console errors

## Next Steps After Deployment

1. Share URL with users for feedback
2. Monitor usage and errors
3. Plan future enhancements
4. Consider custom domain
5. Set up analytics

---

**Need Help?**
- Check [SETUP.md](./SETUP.md) for detailed setup instructions
- Review [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for technical details
- See [QUICK_START.md](./QUICK_START.md) for quick reference

Good luck with your deployment! 🚀
