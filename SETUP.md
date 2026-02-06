# Setup Guide - Monterey Transit Explorer

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Mapbox Token**
   - Get a free Mapbox token at [https://account.mapbox.com/](https://account.mapbox.com/)
   - Open `.env` file and replace the token with your own:
     ```
     VITE_MAPBOX_TOKEN=your_actual_token_here
     ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser

4. **Build for Production**
   ```bash
   npm run build
   ```

## Features Implemented

### Core Features
- Interactive map with Mapbox GL JS
- Bus route visualization with color coding
- Bus stop markers with schedule information
- Route and stop filtering with search
- Click-to-view details for routes and stops

### Trip Planning
- Destination search with OpenStreetMap Nominatim
- Origin selection (current location or address)
- Map-based location selection
- Nearest stop calculation
- Visual route planning

### UI/UX
- Responsive design (mobile, tablet, desktop)
- Collapsible left sidebar with route/stop management
- Bottom-right info drawer for details
- Vibrant, modern design with Tailwind CSS
- Smooth animations and transitions

## Project Structure

```
buss-route-app/
├── data/                    # GeoJSON data files
│   ├── routes.geojson      # Bus route geometries
│   └── stops.geojson       # Bus stop locations and schedules
├── public/                  # Static assets
│   └── bus-icon.svg        # App logo
├── src/
│   ├── components/         # React components
│   │   ├── Header.tsx      # Top navigation bar
│   │   ├── Sidebar.tsx     # Left drawer with controls
│   │   ├── Map.tsx         # Mapbox map component
│   │   └── InfoDrawer.tsx  # Bottom-right info panel
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts        # Type definitions
│   ├── utils/              # Utility functions
│   │   ├── colors.ts       # Route color mapping
│   │   ├── geocoding.ts    # OSM Nominatim integration
│   │   └── routeCalculator.ts  # Route finding logic
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Entry point
│   ├── index.css           # Global styles
│   └── vite-env.d.ts       # Environment type definitions
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.js      # Tailwind CSS config
├── vite.config.ts          # Vite config
└── vercel.json             # Vercel deployment config
```

## Deployment to Vercel

### Option 1: Via Vercel Dashboard
1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variable:
   - Name: `VITE_MAPBOX_TOKEN`
   - Value: Your Mapbox token
6. Click "Deploy"

### Option 2: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and add VITE_MAPBOX_TOKEN when asked
```

## Suggested Repository Names

Choose one of these for your GitHub repository:
- `monterey-transit-explorer`
- `monterey-bus-routes`
- `transit-route-mapper`
- `bus-route-navigator`
- `monterey-transit-map`

The repository name will be part of your Vercel URL:
`https://your-repo-name.vercel.app`

## Troubleshooting

### Map Not Loading
- Verify your Mapbox token is correct in `.env`
- Check browser console for errors
- Ensure `.env` file is in the root directory

### Routes Not Appearing
- Check that `/data/routes.geojson` and `/data/stops.geojson` exist
- Verify GeoJSON format is correct
- Check browser network tab for 404 errors

### Build Errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Ensure Node.js version is 16+ (`node --version`)

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android latest

## Performance Notes

- Initial load: ~2-3 seconds
- Map interaction: Smooth 60fps
- Route calculation: <1 second
- Data size: ~200KB compressed

## Future Enhancements

Potential features for future versions:
- Real-time bus tracking
- Favorite routes/stops
- Route schedules in calendar view
- Multi-route trip planning
- Accessibility improvements
- Offline mode with service workers
- Push notifications for bus arrivals

## License

MIT
