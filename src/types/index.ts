export interface RouteProperties {
  id: number;
  name: string;
  Route: number;
}

export interface RouteFeature {
  type: 'Feature';
  properties: RouteProperties;
  geometry: {
    type: 'MultiLineString';
    coordinates: number[][][];
  };
}

export interface RouteCollection {
  type: 'FeatureCollection';
  name: string;
  features: RouteFeature[];
}

export interface StopProperties {
  Name: string;
  time1: string | null;
  time2: string | null;
  time3: string | null;
  time4: string | null;
  route: string;
}

export interface StopFeature {
  type: 'Feature';
  properties: StopProperties;
  geometry: {
    type: 'Point';
    coordinates: [number, number, number];
  };
}

export interface StopCollection {
  type: 'FeatureCollection';
  name: string;
  features: StopFeature[];
}

export interface GeocodingResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export interface LocationPoint {
  lat: number;
  lng: number;
  address?: string;
}

export interface RouteInfo {
  route: RouteFeature;
  stops: StopFeature[];
}

export interface PlannedRoute {
  origin: LocationPoint;
  destination: LocationPoint;
  roadRoute: {
    coordinates: [number, number][];
    distance: number;
    duration: number;
  };
  nearestOriginStop?: StopFeature;
  nearestDestinationStop?: StopFeature;
}

export type MapStyle = 'streets' | 'satellite';
