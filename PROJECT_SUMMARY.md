# Monterey Transit Explorer - Project Summary

## Overview
A modern, interactive web application for exploring Monterey's bus routes and planning trips. Built with React, TypeScript, and Mapbox GL JS.

## Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Mapping**: Mapbox GL JS
- **Geocoding**: OpenStreetMap Nominatim API
- **Icons**: Lucide React
- **Deployment**: Vercel

## Key Features Implemented

### 1. Interactive Map
- Mapbox-powered interactive map
- Automatic bounds fitting to route data
- Smooth zoom and pan controls
- Custom markers and route lines

### 2. Route Visualization
- Color-coded bus routes (Route 40: Red, Route 94: Teal)
- Toggle routes on/off via checklist
- Click routes to view details
- Route search functionality

### 3. Stop Management
- Stop markers with color matching their route
- Click stops to view schedule times
- Stop search with filtering
- Schedule display (Time 1, 2, 3, 4 with null handling)

### 4. Trip Planning
- **Destination Search**: Type-ahead with OSM Nominatim
- **Origin Options**:
  - Current location (with geolocation)
  - Manual address entry
  - Click on map to select
- **Route Calculation**: Finds nearest stops to origin/destination
- **Visual Route Display**: Shows planned path with custom markers
- **Clear Route**: Reset all selections

### 5. Responsive UI
- Mobile-first design
- Collapsible sidebar on mobile
- Touch-friendly controls
- Adaptive layouts for all screen sizes

### 6. User Experience
- Vibrant, modern design
- Smooth animations
- Loading states
- Error handling
- Intuitive navigation

## File Structure

```
src/
├── components/
│   ├── Header.tsx          # App header with logo and menu
│   ├── Sidebar.tsx         # Route filtering & trip planner
│   ├── Map.tsx             # Mapbox map integration
│   └── InfoDrawer.tsx      # Route/stop details popup
├── types/
│   └── index.ts            # TypeScript interfaces
├── utils/
│   ├── colors.ts           # Route color mapping
│   ├── geocoding.ts        # Address search
│   └── routeCalculator.ts  # Nearest stop finder
├── App.tsx                 # Main app component
├── main.tsx                # Entry point
└── index.css               # Global styles

data/
├── routes.geojson          # Bus route geometries
└── stops.geojson           # Stop locations & schedules
```

## Design Decisions

### Color Scheme
- Primary: Sky blue (#0ea5e9) - Modern, trust-inspiring
- Route 40: Red (#FF6B6B) - High visibility
- Route 94: Teal (#4ECDC4) - Distinct from Route 40
- Success: Green (#10b981) - For planned routes
- Neutral: Gray scale - For text and backgrounds

### Layout
- Fixed header (64px height)
- Collapsible left sidebar (320px width on desktop)
- Full-screen map
- Bottom-right popup drawer (contextual)

### Interactions
1. Click route line → Show route details
2. Click stop marker → Show stop schedule
3. Toggle checkbox → Show/hide route
4. Search bar → Filter routes/stops
5. Plan trip → Opens trip planner section
6. Select from map → Crosshair cursor for location selection

## Performance Optimizations
- Lazy loading of map tiles
- Debounced search (300ms)
- Efficient GeoJSON rendering
- Minimal re-renders with proper React patterns

## Accessibility
- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on all controls
- High contrast colors

## Browser Compatibility
- Chrome/Edge 90+
- Firefox 90+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Data Format

### routes.geojson
```json
{
  "type": "Feature",
  "properties": {
    "id": 1,
    "name": "Cramel-Sand City",
    "Route": 94
  },
  "geometry": {
    "type": "MultiLineString",
    "coordinates": [[[lng, lat], ...]]
  }
}
```

### stops.geojson
```json
{
  "type": "Feature",
  "properties": {
    "Name": "Chomp",
    "time1": "9:35",
    "time2": "10:59",
    "time3": "12:59",
    "time4": "2:59",
    "route": "94"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [lng, lat, 0]
  }
}
```

## Deployment Instructions

### Local Development
```bash
npm install
npm run dev
```
Access at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview  # Test production build locally
```

### Vercel Deployment
1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variable: `VITE_MAPBOX_TOKEN`
4. Deploy

### Suggested Repository Names
1. `monterey-transit-explorer` (Recommended)
2. `monterey-bus-routes`
3. `transit-route-mapper`

## Environment Variables
```
VITE_MAPBOX_TOKEN=your_token_here
```
Get free token at: https://account.mapbox.com/

## Known Limitations & Future Enhancements

### Current Limitations
- Static route data (no real-time updates)
- Simple route planning (nearest stop only)
- No route transfer suggestions
- Single language (English)

### Recommended Enhancements
1. **Real-time tracking**: Integrate live bus locations
2. **Advanced routing**: Multi-route trip planning with transfers
3. **Favorites**: Save frequently used routes/stops
4. **Notifications**: Bus arrival alerts
5. **Offline mode**: Service worker for offline access
6. **Multi-language**: i18n support
7. **Accessibility**: Screen reader improvements
8. **Analytics**: User behavior tracking
9. **Print view**: Printable route schedules
10. **Share feature**: Share trips via URL

## Testing Checklist

### Desktop
- [x] Routes load on map
- [x] Routes can be toggled on/off
- [x] Stops appear when route is visible
- [x] Click route shows details
- [x] Click stop shows schedule
- [x] Search filters routes
- [x] Search filters stops
- [x] Trip planner opens/closes
- [x] Address search works
- [x] Current location works
- [x] Map selection works
- [x] Route planning displays path
- [x] Clear route works

### Mobile
- [x] Sidebar toggles correctly
- [x] Map is touch responsive
- [x] All buttons are tap-friendly
- [x] Drawers slide smoothly
- [x] Search is usable on small screens
- [x] Layout adapts to portrait/landscape

## Success Metrics
- **Load time**: <3 seconds on 4G
- **Interaction delay**: <100ms for all clicks
- **Mobile usability**: Touch targets ≥44px
- **Accessibility**: WCAG 2.1 AA compliant
- **Browser support**: 95%+ of modern browsers

## Maintenance Notes
- Update Mapbox token before expiration
- Monitor Nominatim API usage (free tier limits)
- Keep dependencies updated monthly
- Test on new browser versions

## Credits
- Maps: Mapbox
- Geocoding: OpenStreetMap Nominatim
- Icons: Lucide React
- Framework: React + Vite
- Styling: Tailwind CSS

## License
MIT License

---

**Built for**: Monterey Transit Authority Demo
**Version**: 1.0.0
**Last Updated**: February 2026
