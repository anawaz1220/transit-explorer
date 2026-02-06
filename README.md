# Monterey Transit Explorer

An interactive, mobile-friendly web application for exploring Monterey's bus routes, stops, and planning trips.

## Features

- **Interactive Map**: View all bus routes and stops on a clean, zoomable map
- **Route Filtering**: Toggle routes on/off with color-coded visualization
- **Stop Details**: Click any stop to view schedule times
- **Trip Planning**: Enter origin and destination to find nearest stops
- **Search**: Quickly find routes and stops with search functionality
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Mapbox GL JS
- OpenStreetMap Nominatim (geocoding)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and add your Mapbox token:
   ```
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```
   Get a free token at [https://account.mapbox.com/](https://account.mapbox.com/)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Deployment

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. **IMPORTANT**: Add your `VITE_MAPBOX_TOKEN` environment variable in Vercel settings:
   - Go to Project Settings > Environment Variables
   - Add a new variable: `VITE_MAPBOX_TOKEN` with your Mapbox token
   - Make sure to add it for Production, Preview, and Development environments
4. Deploy!

### Troubleshooting Vercel Deployment

If you encounter issues with map clicking or routes not working on Vercel:

1. **Check Browser Console**: Open Developer Tools and check for any errors
2. **Verify Environment Variable**: Ensure `VITE_MAPBOX_TOKEN` is set correctly in Vercel
3. **Check CORS Issues**: The app uses external APIs (Nominatim for geocoding, OSRM for routing)
4. **Clear Cache**: After updating environment variables, trigger a new deployment
5. **Check Logs**: Use `console.log` statements are added throughout the app for debugging

### API Services Used

The application relies on these free external services:
- **Mapbox GL JS**: Map rendering (requires API token)
- **OpenStreetMap Nominatim**: Address geocoding and reverse geocoding
- **OSRM**: Route calculation between points

Make sure these services are accessible from your deployment environment.

## Data Files

The application uses GeoJSON files located in `/data`:
- `routes.geojson` - Bus route lines
- `stops.geojson` - Bus stop locations and schedules

## License

MIT
