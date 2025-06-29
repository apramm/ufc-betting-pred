# GitHub Pages Deployment Guide

## Setup Complete! ✅

Your frontend is now configured for GitHub Pages deployment. Here's how to deploy:

## Deployment Steps

### Option 1: Deploy from Root Directory (Recommended)
```bash
# From the project root directory
npm run deploy
```

### Option 2: Deploy from Frontend Directory
```bash
# Navigate to frontend directory
cd frontend

# Deploy
npm run deploy
```

## What Was Configured

### Frontend package.json updates:
- ✅ Added `homepage` field pointing to your GitHub Pages URL
- ✅ Added `predeploy` and `deploy` scripts
- ✅ Added `gh-pages` as dev dependency

### Root package.json updates:
- ✅ Updated scripts to work with frontend directory structure
- ✅ Fixed `client`, `build`, and `deploy` scripts
- ✅ Updated homepage URL

## Your GitHub Pages URL
🌐 **https://apramm.github.io/ufc-betting-pred**

## First Time Deployment

1. **Make sure your GitHub repo is set up:**
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

2. **Deploy the frontend:**
   ```bash
   npm run deploy
   ```

3. **Enable GitHub Pages:**
   - Go to your GitHub repository
   - Click on "Settings" tab
   - Scroll down to "Pages" section
   - Under "Source", select "Deploy from a branch"
   - Select "gh-pages" branch
   - Click "Save"

## Future Deployments

After the initial setup, you only need to run:
```bash
npm run deploy
```

This will:
1. Build the React app
2. Create/update the `gh-pages` branch
3. Deploy to GitHub Pages automatically

## Troubleshooting

### If deployment fails:
1. Make sure you're committed and pushed to GitHub
2. Check that the repository name matches your homepage URL
3. Ensure GitHub Pages is enabled in repository settings

### If the site doesn't load:
1. Wait a few minutes for GitHub Pages to update
2. Check the GitHub Pages settings in your repository
3. Make sure the homepage URL is correct

## Repository Structure After Deployment

```
your-repo/
├── main branch (your code)
└── gh-pages branch (automatically created, contains built React app)
```

The `gh-pages` branch is automatically managed by the gh-pages package.

## Commands Summary

- `npm run deploy` - Deploy frontend to GitHub Pages
- `npm run build` - Build frontend for production
- `npm run dev` - Run both frontend and backend in development
- `npm start` - Run backend server only
- `cd frontend && npm start` - Run frontend only

Your frontend should now be successfully deployed! 🚀
