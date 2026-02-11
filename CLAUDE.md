# Claude Code Documentation - Monterey Transit Explorer

This document is for future AI assistants (Claude or others) who will be working on this project. It provides context, architectural decisions, and important notes.

## Project Overview

**Name**: Monterey Transit Explorer
**Type**: Interactive Bus Route & Trip Planning Web Application
**Target Users**: Monterey, California transit users
**Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Mapbox GL JS

## Purpose

An interactive, mobile-friendly web application for exploring Monterey's bus routes, stops, and planning trips. Users can:
- View all bus routes and stops on an interactive map
- Filter routes by toggling them on/off
- Click stops to view schedule times
- Plan trips with origin/destination search
- Use current location for trip planning
- View route details when clicking on planned routes

## Architecture

### Component Structure

```
src/
├── components/
│   ├── Header.tsx          - Top navigation bar with menu toggle
│   ├── Sidebar.tsx         - Route filtering & trip planner form
│   ├── Map.tsx             - Mapbox GL integration (PRIMARY MAP COMPONENT)
│   ├── InfoDrawer.tsx      - Route/stop/planned-route details popup
│   └── Toast.tsx           - Notification system
├── types/
│   └── index.ts            - TypeScript interfaces
├── utils/
│   ├── colors.ts           - Route color mapping
│   ├── geocoding.ts        - Address search & current location (Nominatim API)
│   ├── routeCalculator.ts  - Nearest stop finder (Haversine formula)
│   └── routing.ts          - OSRM-based road routing
├── App.tsx                 - Main app - state management hub
└── main.tsx                - React entry point
```

### State Management

**App.tsx** is the central state manager. All state flows through it:

- **Map Data**: `routes`, `stops`, `visibleRoutes`
- **UI State**: `isSidebarOpen`, `infoDrawerOpen`, `infoDrawerType`
- **Selection State**: `selectedRoute`, `selectedStop`, `hoveredStop`
- **Trip Planning**: `plannedRoute`, `tempOrigin`, `tempDestination`
- **Map Interaction**: `selectingFromMap`
- **Notifications**: `toast`

### Data Flow

1. **User Input** → Sidebar component
2. **Sidebar** → App.tsx (state update)
3. **App.tsx** → Map component (re-render)
4. **Map Events** → App.tsx → InfoDrawer

## Key Features & Implementation Details

### 1. Current Location Feature

**Files**: `Sidebar.tsx`, `App.tsx`, `Map.tsx`, `geocoding.ts`

**Flow**:
1. User clicks "Current location" button in Sidebar
2. `handleUseCurrentLocation()` calls browser's `navigator.geolocation.getCurrentPosition()`
3. Location is reverse geocoded using Nominatim API
4. `onSetOrigin(location)` updates App's `tempOrigin` state
5. Map component's `useEffect` detects `tempOrigin` change
6. Map flies to location with `map.flyTo()` and places green marker

**Important Notes**:
- Works globally (not limited to Monterey area)
- Browser must grant location permission
- Reverse geocoding may be slow for international locations
- Toast notifications show progress (info → success/error)

### 2. Route Planning

**Files**: `App.tsx`, `routing.ts`, `routeCalculator.ts`

**Flow**:
1. User enters origin and destination (via search, map click, or current location)
2. User can select Walking (default) or Driving mode
3. `handlePlanRoute()` in App.tsx calls:
   - `getRouteBetweenPoints()` - Mapbox Directions API for road/walking route
   - `findNearestStop()` - Haversine distance to find nearest bus stops
4. Creates `PlannedRoute` object with all data including mode
5. Map renders green route line
6. Map auto-fits bounds to show entire route

**External API**: Mapbox Directions API
- Walking: `https://api.mapbox.com/directions/v5/mapbox/walking/...`
- Driving: `https://api.mapbox.com/directions/v5/mapbox/driving/...`

**Important**:
- Walking and driving use completely separate route geometries
- Walking routes use pedestrian paths, sidewalks, crosswalks
- Driving routes use roads optimized for cars
- Route is recalculated when mode changes (not just time adjustment)

### 3. Interactive Map

**File**: `Map.tsx`

**Key Implementation Details**:

- **Mapbox GL JS 3.1.2** for rendering
- **Environment Variable**: `VITE_MAPBOX_TOKEN` (REQUIRED)
- **Coordinate System**: Converts EPSG:3857 to WGS84 using `epsg3857ToWgs84()`
- **Two Map Styles**: Streets (light-v11) and Satellite (satellite-streets-v12)

**Layers** (in order):
1. `routes-layer` - Bus route lines (LineString)
2. `stops-layer` - Bus stops (Circle markers)
3. `stops-highlighted` - Hover/selected stop highlight
4. `planned-route-layer` - User's planned route (green line)

**Event Handlers**:
- Click on route → Opens InfoDrawer with route details
- Click on stop → Opens InfoDrawer with schedule
- Click on planned route → Opens InfoDrawer with trip details
- Map click (when selecting) → Sets origin/destination

**Important**: Event listeners use `e.preventDefault()` to prevent conflicts

### 4. InfoDrawer Component

**File**: `InfoDrawer.tsx`

**Three Display Types**:
1. **'route'** - Shows route name, all stops with schedules
2. **'stop'** - Shows stop name, location, schedule times
3. **'planned-route'** - Shows origin, destination, distance, time, nearest bus route

**Styling**: Header background color matches route color for visual consistency

### 5. Geocoding

**File**: `geocoding.ts`

**API**: OpenStreetMap Nominatim
**Endpoints**:
- Search: `nominatim.openstreetmap.org/search`
- Reverse: `nominatim.openstreetmap.org/reverse`

**User-Agent**: `MontereyTransitExplorer/1.0` (required by Nominatim)

**Rate Limits**: Nominatim has usage limits - consider caching or alternative services for high-traffic production

## Data Files

### routes.geojson
- **Type**: FeatureCollection
- **Geometry**: MultiLineString (EPSG:3857 coordinates)
- **Properties**: `id`, `name`, `Route` (route number)
- **Size**: ~14.5 KB

### stops.geojson
- **Type**: FeatureCollection
- **Geometry**: Point (WGS84 coordinates)
- **Properties**: `Name`, `time1-4`, `route`
- **Size**: ~2.6 KB

## Environment Variables

### VITE_MAPBOX_TOKEN
**CRITICAL**: Required for map to work
**Get it**: https://account.mapbox.com/
**Location**: `.env` file (dev), Vercel environment variables (prod)

**If Missing**: Map won't initialize, console error will show

## Known Issues & Solutions

### Issue 1: Routes and Stops Not Clickable After Map Style Change
**Cause**: Event listeners were attached in `addSourcesAndLayers()` which only ran once. When map style changed (street/satellite toggle), layers were re-added but event listeners were lost.
**Solution**: Moved event listener setup to a separate `useEffect` hook that properly cleans up and re-attaches listeners when routes/stops data changes. This ensures clicks work even after style changes.
**Files**: `Map.tsx` lines 203-262

### Issue 2: Map Clicks Not Working in Production
**Cause**: Event listener cleanup not properly handled, conflicts between layers
**Solution**: Removed event listeners before removing layers, added try-catch blocks, proper `e.preventDefault()`

### Issue 3: Current Location Doesn't Fly Map (International Users)
**Cause**: Local state in Sidebar wasn't updating parent's `tempOrigin`
**Solution**: Added `onSetOrigin` callback to update parent state, which triggers map fly animation
**Note**: Works globally for any location, not just Monterey area

### Issue 4: CORS Errors with External APIs
**Cause**: Nominatim/OSRM may block certain origins
**Solution**: Added User-Agent headers, comprehensive error handling

## Development Guidelines

### Adding New Features

1. **State**: Add to App.tsx if shared across components
2. **Types**: Define in `types/index.ts`
3. **Callbacks**: Pass down from App.tsx to child components
4. **Map Layers**: Add in Map.tsx's `addSourcesAndLayers()`
5. **Styling**: Use Tailwind classes, follow existing patterns

### Code Style

- **TypeScript**: Strict type checking enabled
- **React**: Functional components with hooks
- **State**: Use proper dependency arrays in useEffect
- **Error Handling**: Always wrap async operations in try-catch
- **Logging**: Use console.log/error for debugging (especially in production)

### Testing Locally

```bash
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

### Deploying to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. **CRITICAL**: Add `VITE_MAPBOX_TOKEN` in Project Settings → Environment Variables
4. Deploy

**Troubleshooting**:
- Check browser console for errors
- Verify environment variable is set
- Check OSRM/Nominatim API status
- Clear Vercel cache and redeploy

## Common Tasks

### Adding a New Route Color
Edit `src/utils/colors.ts`:
```typescript
export function getRouteColor(routeNumber: string | number): string {
  const colors: { [key: number]: string } = {
    // ... existing colors
    99: '#YOUR_COLOR', // Add new route
  };
  return colors[Number(routeNumber)] || '#94A3B8'; // Default gray
}
```

### Changing Map Default Location
Edit `src/components/Map.tsx` line 162:
```typescript
center: [-121.8, 36.6], // [longitude, latitude]
zoom: 10,
```

### Adding New Toast Notification
```typescript
setToast({
  message: 'Your message here',
  type: 'success' | 'info' | 'error'
});
```

## Performance Notes

- **Bundle Size**: ~1.8 MB (mostly Mapbox GL)
- **Optimization**: Consider code-splitting if adding more features
- **Mapbox**: Uses WebGL, requires decent GPU
- **Mobile**: Fully responsive, tested on iOS and Android
  - Drawer takes 50% of screen height on mobile/tablet (leaving 50% for map interaction)
  - No overlay blocking map - both drawer and map are interactive simultaneously
  - Critical for "Choose from map" feature during trip planning

## Security Considerations

- **API Keys**: Mapbox token is client-side visible (normal for this use case)
- **CORS**: All external APIs are public, no authentication
- **User Location**: Requested with user permission, not stored

## Future Enhancement Ideas

1. **Real-time Bus Tracking**: Add live bus locations
2. **Offline Mode**: Cache routes/stops with Service Worker
3. **Favorites**: Let users save frequent routes/stops
4. **Accessibility**: Add ARIA labels, keyboard navigation
5. **Multi-language**: Support Spanish for Monterey users
6. **Route Comparison**: Show multiple route options
7. **Time-based Filtering**: Show only routes running now

## Dependencies

### Production
- react 18.3.1
- react-dom 18.3.1
- mapbox-gl 3.1.2
- lucide-react 0.309.0

### Development
- typescript 5.6.3
- vite 5.4.11
- tailwindcss 3.4.1
- @types/react, @types/react-dom, @types/mapbox-gl

## License

MIT

## Contact & Support

For issues or questions:
1. Check browser console for errors
2. Verify all environment variables are set
3. Test with `npm run build` before deploying
4. Check GitHub issues (if repository is public)

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Maintained By**: Claude Code (AI Assistant)
