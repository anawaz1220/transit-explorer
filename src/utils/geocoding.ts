import { GeocodingResult, LocationPoint } from '../types';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export async function searchAddress(query: string): Promise<LocationPoint[]> {
  if (!query || query.length < 3) return [];

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=us`,
      {
        headers: {
          'User-Agent': 'MontereyTransitExplorer/1.0',
        },
      }
    );

    if (!response.ok) throw new Error('Geocoding request failed');

    const results: GeocodingResult[] = await response.json();

    // Convert to LocationPoint format
    return results.map(result => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'User-Agent': 'MontereyTransitExplorer/1.0',
        },
      }
    );

    if (!response.ok) throw new Error('Reverse geocoding failed');

    const data = await response.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export async function getCurrentLocation(): Promise<LocationPoint | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const address = await reverseGeocode(lat, lng);
        resolve({ lat, lng, address });
      },
      (error) => {
        console.error('Error getting location:', error);
        resolve(null);
      }
    );
  });
}
