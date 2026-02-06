import { LocationPoint } from '../types';

export interface RouteGeometry {
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
}

/**
 * Get actual road-based route between two points using OSRM (free routing service)
 */
export async function getRouteBetweenPoints(
  origin: LocationPoint,
  destination: LocationPoint
): Promise<RouteGeometry | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

    console.log('Fetching route from OSRM:', { origin, destination });

    const response = await fetch(url);

    if (!response.ok) {
      console.error('OSRM routing request failed with status:', response.status);
      throw new Error('Routing request failed');
    }

    const data = await response.json();
    console.log('OSRM response:', data);

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.warn('OSRM returned no routes:', data);
      return null;
    }

    const route = data.routes[0];

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
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
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
