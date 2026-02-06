# Quick Start Guide

## Get Mapbox Token (Free)
1. Go to https://account.mapbox.com/
2. Sign up for free account
3. Copy your default public token
4. Paste it in `.env` file:
   ```
   VITE_MAPBOX_TOKEN=pk.your_actual_token_here
   ```

## Run Locally
```bash
npm install     # Install dependencies (first time only)
npm run dev     # Start development server
```
Open http://localhost:5173

## Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel
```

When prompted for environment variables, add:
- **Name**: `VITE_MAPBOX_TOKEN`
- **Value**: Your Mapbox token

## Repository Name Suggestions
- `monterey-transit-explorer` ⭐ Recommended
- `monterey-bus-routes`
- `transit-route-mapper`

Your live URL will be: `https://[repo-name].vercel.app`

## Test the App
1. ✅ See routes and stops on map
2. ✅ Toggle routes with checkboxes
3. ✅ Click routes/stops for details
4. ✅ Search for routes or stops
5. ✅ Plan trip with origin/destination
6. ✅ Use current location
7. ✅ Select location from map
8. ✅ Clear and reset route

## Support
- See [SETUP.md](./SETUP.md) for detailed instructions
- See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for technical details
- Check browser console for any errors

## Features
- 🗺️ Interactive Mapbox map
- 🚍 Color-coded bus routes
- 📍 Bus stop markers with schedules
- 🔍 Search routes and stops
- 🧭 Trip planning with geocoding
- 📱 Fully responsive (mobile-friendly)
- ⚡ Fast and modern UI

Enjoy exploring Monterey's transit routes! 🚌
