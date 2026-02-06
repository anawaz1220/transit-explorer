import { StopFeature, LocationPoint } from '../types';

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function findNearestStop(
  location: LocationPoint,
  stops: StopFeature[]
): StopFeature | null {
  if (stops.length === 0) return null;

  let nearestStop = stops[0];
  let minDistance = calculateDistance(
    location.lat,
    location.lng,
    stops[0].geometry.coordinates[1],
    stops[0].geometry.coordinates[0]
  );

  for (const stop of stops) {
    const distance = calculateDistance(
      location.lat,
      location.lng,
      stop.geometry.coordinates[1],
      stop.geometry.coordinates[0]
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestStop = stop;
    }
  }

  return nearestStop;
}

export interface RouteResult {
  originStop: StopFeature;
  destinationStop: StopFeature;
  distance: number;
  route: string;
}

export function calculateRoute(
  origin: LocationPoint,
  destination: LocationPoint,
  stops: StopFeature[]
): RouteResult | null {
  const originStop = findNearestStop(origin, stops);
  const destStop = findNearestStop(destination, stops);

  if (!originStop || !destStop) return null;

  const distance =
    calculateDistance(
      origin.lat,
      origin.lng,
      originStop.geometry.coordinates[1],
      originStop.geometry.coordinates[0]
    ) +
    calculateDistance(
      destination.lat,
      destination.lng,
      destStop.geometry.coordinates[1],
      destStop.geometry.coordinates[0]
    );

  return {
    originStop,
    destinationStop: destStop,
    distance,
    route: originStop.properties.route,
  };
}
