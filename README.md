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
3. Add your `VITE_MAPBOX_TOKEN` environment variable in Vercel settings
4. Deploy!

## Data Files

The application uses GeoJSON files located in `/data`:
- `routes.geojson` - Bus route lines
- `stops.geojson` - Bus stop locations and schedules

## License

MIT
