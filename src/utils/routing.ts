import { LocationPoint } from '../types';

export interface RouteGeometry {
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
}

export type RouteMode = 'walking' | 'driving';

/**
 * Get actual road-based route between two points using Mapbox Directions API
 * Walking and driving use completely separate route geometries
 */
export async function getRouteBetweenPoints(
  origin: LocationPoint,
  destination: LocationPoint,
  mode: RouteMode = 'walking'
): Promise<RouteGeometry | null> {
  try {
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

    if (!mapboxToken) {
      console.error('VITE_MAPBOX_TOKEN is not set');
      throw new Error('Mapbox token is required for routing');
    }

    // Use Mapbox Directions API with proper profiles
    // walking → mapbox/walking (pedestrian paths, sidewalks, etc.)
    // driving → mapbox/driving (roads optimized for cars)
    const profile = mode === 'walking' ? 'mapbox/walking' : 'mapbox/driving';
    const url = `https://api.mapbox.com/directions/v5/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=geojson&overview=full&access_token=${mapboxToken}`;

    console.log('Fetching route from Mapbox Directions API:', { origin, destination, mode, profile });

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Mapbox Directions API request failed with status:', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Routing request failed');
    }

    const data = await response.json();
    console.log('Mapbox Directions API response:', data);

    if (!data.routes || data.routes.length === 0) {
      console.warn('Mapbox returned no routes:', data);
      return null;
    }

    const route = data.routes[0];

    console.log(`Route calculated for ${mode} mode:`, {
      mode: mode,
      profile: profile,
      distance: route.distance,
      duration: route.duration,
      coordinatesCount: route.geometry.coordinates.length,
      firstCoord: route.geometry.coordinates[0],
      lastCoord: route.geometry.coordinates[route.geometry.coordinates.length - 1]
    });

    return {
      coordinates: route.geometry.coordinates,
      distance: route.distance,
      duration: route.duration,
    };
  } catch (error) {
    console.error('Routing error:', error);
    return null;
  }
}

/**
 * Format distance for display (in miles)
 */
export function formatDistance(meters: number): string {
  // Convert meters to miles (1 mile = 1609.34 meters)
  const miles = meters / 1609.34;

  if (miles < 0.1) {
    // Show in feet for very short distances (1 mile = 5280 feet)
    const feet = Math.round(miles * 5280);
    return `${feet} ft`;
  }

  return `${miles.toFixed(1)} mi`;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
