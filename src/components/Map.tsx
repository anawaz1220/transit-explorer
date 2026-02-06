import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Layers, RotateCcw } from 'lucide-react';
import { RouteFeature, StopFeature, LocationPoint, PlannedRoute } from '../types';
import { getRouteColor } from '../utils/colors';
import { reverseGeocode } from '../utils/geocoding';

// Get Mapbox token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Convert EPSG:3857 to WGS84
function epsg3857ToWgs84(x: number, y: number): [number, number] {
  const lon = (x / 20037508.34) * 180;
  let lat = (y / 20037508.34) * 180;
  lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
  return [lon, lat];
}

interface MapProps {
  routes: RouteFeature[];
  stops: StopFeature[];
  visibleRoutes: Set<number>;
  onRouteClick: (route: RouteFeature) => void;
  onStopClick: (stop: StopFeature) => void;
  selectedRoute: RouteFeature | null;
  selectedStop: StopFeature | null;
  plannedRoute: PlannedRoute | null;
  selectingFromMap: 'origin' | 'destination' | null;
  onMapSelect: (location: LocationPoint) => void;
  tempOrigin: LocationPoint | null;
  tempDestination: LocationPoint | null;
  hoveredStop: StopFeature | null;
  onResetMap: () => void;
  shouldResetMapView: boolean;
  onMapViewReset: () => void;
  onPlannedRouteClick: () => void;
}

export default function Map({
  routes,
  stops,
  visibleRoutes,
  onRouteClick,
  onStopClick,
  selectedRoute,
  selectedStop,
  plannedRoute,
  selectingFromMap,
  onMapSelect,
  tempOrigin,
  tempDestination,
  hoveredStop,
  onResetMap,
  shouldResetMapView,
  onMapViewReset,
  onPlannedRouteClick,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Helper function to add sources and layers
  const addSourcesAndLayers = () => {
    if (!map.current) return;

    // Add routes source
    map.current.addSource('routes', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    // Add routes layer
    map.current.addLayer({
      id: 'routes-layer',
      type: 'line',
      source: 'routes',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 4,
        'line-opacity': 0.8,
      },
    });

    // Add stops source
    map.current.addSource('stops', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    // Add stops layer
    map.current.addLayer({
      id: 'stops-layer',
      type: 'circle',
      source: 'stops',
      paint: {
        'circle-radius': 8,
        'circle-color': ['get', 'color'],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    // Add highlighted stop layer
    map.current.addLayer({
      id: 'stops-highlighted',
      type: 'circle',
      source: 'stops',
      paint: {
        'circle-radius': 14,
        'circle-color': ['get', 'color'],
        'circle-opacity': 0.4,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
      },
      filter: ['==', 'Name', ''],
    });
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Check if Mapbox token is available
    if (!mapboxgl.accessToken) {
      console.error('Mapbox token is missing! Please check your environment variables.');
      return;
    }

    console.log('Initializing map with token:', mapboxgl.accessToken.substring(0, 10) + '...');

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-121.8, 36.6],
      zoom: 10,
    });

    // Disable traffic data
    map.current.on('style.load', () => {
      const layers = map.current!.getStyle().layers;
      if (layers) {
        layers.forEach((layer) => {
          if (layer.id.includes('traffic')) {
            map.current!.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        });
      }
    });

    map.current.on('load', () => {
      addSourcesAndLayers();
      setMapLoaded(true);

      // Fit to routes bounds
      if (routes.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        routes.forEach((route) => {
          route.geometry.coordinates.forEach((lineString) => {
            lineString.forEach((coord) => {
              const [lng, lat] = epsg3857ToWgs84(coord[0], coord[1]);
              bounds.extend([lng, lat] as [number, number]);
            });
          });
        });
        map.current!.fitBounds(bounds, { padding: 50 });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Toggle map style
  const toggleMapStyle = () => {
    if (!map.current) return;

    const newStyle = mapStyle === 'streets' ? 'satellite' : 'streets';
    const styleUrl =
      newStyle === 'streets'
        ? 'mapbox://styles/mapbox/light-v11'
        : 'mapbox://styles/mapbox/satellite-streets-v12';

    map.current.setStyle(styleUrl);
    setMapStyle(newStyle);

    // Re-add sources and layers after style change
    map.current.once('style.load', () => {
      addSourcesAndLayers();
      setMapLoaded(false);
      setTimeout(() => setMapLoaded(true), 100);
    });
  };

  // Set up click event handlers for routes and stops
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Route click handler
    const handleRouteClick = (e: mapboxgl.MapMouseEvent) => {
      try {
        e.preventDefault();
        if (e.features && e.features[0]) {
          const routeId = e.features[0].properties?.Route;
          const route = routes.find((r) => r.properties.Route === routeId);
          if (route) {
            console.log('Route clicked:', routeId);
            onRouteClick(route);
          }
        }
      } catch (error) {
        console.error('Error handling route click:', error);
      }
    };

    // Stop click handler
    const handleStopClick = (e: mapboxgl.MapMouseEvent) => {
      try {
        e.preventDefault();
        if (e.features && e.features[0]) {
          const stopName = e.features[0].properties?.Name;
          const stop = stops.find((s) => s.properties.Name === stopName);
          if (stop) {
            console.log('Stop clicked:', stopName);
            onStopClick(stop);
          }
        }
      } catch (error) {
        console.error('Error handling stop click:', error);
      }
    };

    // Cursor handlers
    const handleRouteMouseEnter = () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    };
    const handleRouteMouseLeave = () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    };
    const handleStopMouseEnter = () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    };
    const handleStopMouseLeave = () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    };

    // Add event listeners
    map.current.on('click', 'routes-layer', handleRouteClick);
    map.current.on('click', 'stops-layer', handleStopClick);
    map.current.on('mouseenter', 'routes-layer', handleRouteMouseEnter);
    map.current.on('mouseleave', 'routes-layer', handleRouteMouseLeave);
    map.current.on('mouseenter', 'stops-layer', handleStopMouseEnter);
    map.current.on('mouseleave', 'stops-layer', handleStopMouseLeave);

    // Cleanup
    return () => {
      if (map.current) {
        map.current.off('click', 'routes-layer', handleRouteClick);
        map.current.off('click', 'stops-layer', handleStopClick);
        map.current.off('mouseenter', 'routes-layer', handleRouteMouseEnter);
        map.current.off('mouseleave', 'routes-layer', handleRouteMouseLeave);
        map.current.off('mouseenter', 'stops-layer', handleStopMouseEnter);
        map.current.off('mouseleave', 'stops-layer', handleStopMouseLeave);
      }
    };
  }, [mapLoaded, routes, stops, onRouteClick, onStopClick]);

  // Update routes on map
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const visibleRouteFeatures = routes
      .filter((route) => visibleRoutes.has(route.properties.Route))
      .flatMap((route) =>
        route.geometry.coordinates.map((lineString) => ({
          type: 'Feature' as const,
          properties: {
            Route: route.properties.Route,
            name: route.properties.name,
            color: getRouteColor(route.properties.Route),
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: lineString.map(coord => epsg3857ToWgs84(coord[0], coord[1])),
          },
        }))
      );

    const source = map.current.getSource('routes') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: visibleRouteFeatures,
      });
    }
  }, [routes, visibleRoutes, mapLoaded]);

  // Update stops on map
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const visibleStops = stops.filter((stop) =>
      visibleRoutes.has(parseInt(stop.properties.route))
    );

    const stopFeatures = visibleStops.map((stop) => ({
      type: 'Feature' as const,
      properties: {
        Name: stop.properties.Name,
        route: stop.properties.route,
        color: getRouteColor(stop.properties.route),
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [stop.geometry.coordinates[0], stop.geometry.coordinates[1]],
      },
    }));

    const source = map.current.getSource('stops') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: stopFeatures,
      });
    }
  }, [stops, visibleRoutes, mapLoaded]);

  // Handle map click for selecting origin/destination
  useEffect(() => {
    if (!map.current) return;

    const handleMapClick = async (e: mapboxgl.MapMouseEvent) => {
      try {
        // Only handle if in selection mode
        if (selectingFromMap) {
          const { lng, lat } = e.lngLat;
          console.log('Map clicked for selection:', { lng, lat, type: selectingFromMap });
          const address = await reverseGeocode(lat, lng);
          onMapSelect({ lat, lng, address });
        }
      } catch (error) {
        console.error('Error handling map click:', error);
      }
    };

    map.current.on('click', handleMapClick);

    // Update cursor
    if (selectingFromMap) {
      map.current.getCanvas().style.cursor = 'crosshair';
    }

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
        if (!selectingFromMap) {
          const canvas = map.current.getCanvas();
          if (canvas) {
            canvas.style.cursor = '';
          }
        }
      }
    };
  }, [selectingFromMap, onMapSelect]);

  // Fly to selected route
  useEffect(() => {
    if (!map.current || !selectedRoute) return;

    const bounds = new mapboxgl.LngLatBounds();
    selectedRoute.geometry.coordinates.forEach((lineString) => {
      lineString.forEach((coord) => {
        const [lng, lat] = epsg3857ToWgs84(coord[0], coord[1]);
        bounds.extend([lng, lat] as [number, number]);
      });
    });

    map.current.fitBounds(bounds, { padding: 100, duration: 1000 });
  }, [selectedRoute]);

  // Fly to selected stop
  useEffect(() => {
    if (!map.current || !selectedStop) return;

    map.current.flyTo({
      center: [selectedStop.geometry.coordinates[0], selectedStop.geometry.coordinates[1]],
      zoom: 15,
      duration: 1000,
    });
  }, [selectedStop]);

  // Update markers for temp origin/destination
  useEffect(() => {
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!map.current) return;

    // Add origin marker
    if (tempOrigin) {
      const el = document.createElement('div');
      el.className = 'origin-marker';
      el.style.width = '24px';
      el.style.height = '32px';
      el.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32"><path fill="%234CAF50" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>')`;
      el.style.backgroundSize = 'contain';

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([tempOrigin.lng, tempOrigin.lat])
        .addTo(map.current);

      markersRef.current.push(marker);

      // Fly to origin location
      map.current.flyTo({
        center: [tempOrigin.lng, tempOrigin.lat],
        zoom: 14,
        duration: 1500,
      });
    }

    // Add destination marker
    if (tempDestination) {
      const el = document.createElement('div');
      el.className = 'destination-marker';
      el.style.width = '24px';
      el.style.height = '32px';
      el.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32"><path fill="%23F44336" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>')`;
      el.style.backgroundSize = 'contain';

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([tempDestination.lng, tempDestination.lat])
        .addTo(map.current);

      markersRef.current.push(marker);

      // Fly to destination location if no origin (to avoid double flying)
      if (!tempOrigin) {
        map.current.flyTo({
          center: [tempDestination.lng, tempDestination.lat],
          zoom: 14,
          duration: 1500,
        });
      }
    }

    // If both origin and destination exist, fit bounds to both
    if (tempOrigin && tempDestination) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([tempOrigin.lng, tempOrigin.lat]);
      bounds.extend([tempDestination.lng, tempDestination.lat]);
      map.current.fitBounds(bounds, { padding: 100, duration: 1500 });
    }
  }, [tempOrigin, tempDestination]);

  // Show planned route
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing planned route and layers
    if (map.current.getLayer('planned-route-layer')) {
      map.current.removeLayer('planned-route-layer');
    }
    if (map.current.getSource('planned-route')) {
      map.current.removeSource('planned-route');
    }

    if (plannedRoute) {
      try {
        // Add route line
        map.current.addSource('planned-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: plannedRoute.roadRoute.coordinates,
            },
          },
        });

        map.current.addLayer({
          id: 'planned-route-layer',
          type: 'line',
          source: 'planned-route',
          paint: {
            'line-color': '#10b981',
            'line-width': 5,
            'line-opacity': 0.8,
          },
        });

        // Add click handler for planned route
        const handlePlannedRouteClick = (e: mapboxgl.MapMouseEvent) => {
          e.preventDefault();
          onPlannedRouteClick();
        };
        map.current.on('click', 'planned-route-layer', handlePlannedRouteClick);

        // Change cursor on hover for planned route
        const handleMouseEnter = () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = 'pointer';
          }
        };
        const handleMouseLeave = () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = '';
          }
        };
        map.current.on('mouseenter', 'planned-route-layer', handleMouseEnter);
        map.current.on('mouseleave', 'planned-route-layer', handleMouseLeave);

        // Fit bounds to planned route
        const bounds = new mapboxgl.LngLatBounds();
        plannedRoute.roadRoute.coordinates.forEach((coord) => {
          bounds.extend(coord as [number, number]);
        });

        map.current.fitBounds(bounds, { padding: 100, duration: 1000 });
      } catch (error) {
        console.error('Error adding planned route to map:', error);
      }
    }
  }, [plannedRoute, mapLoaded, onPlannedRouteClick]);

  // Highlight hovered or selected stop
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const stopToHighlight = hoveredStop || selectedStop;

    if (stopToHighlight && map.current.getLayer('stops-highlighted')) {
      map.current.setFilter('stops-highlighted', ['==', 'Name', stopToHighlight.properties.Name]);
    } else if (map.current.getLayer('stops-highlighted')) {
      map.current.setFilter('stops-highlighted', ['==', 'Name', '']);
    }
  }, [hoveredStop, selectedStop, mapLoaded]);

  // Reset map view when requested
  useEffect(() => {
    if (!map.current || !shouldResetMapView || routes.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    routes.forEach((route) => {
      route.geometry.coordinates.forEach((lineString) => {
        lineString.forEach((coord) => {
          const [lng, lat] = epsg3857ToWgs84(coord[0], coord[1]);
          bounds.extend([lng, lat] as [number, number]);
        });
      });
    });

    map.current.fitBounds(bounds, { padding: 50, duration: 1000 });
    onMapViewReset();
  }, [shouldResetMapView, routes, onMapViewReset]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        {/* Map Style Toggle */}
        <button
          onClick={toggleMapStyle}
          className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors flex items-center gap-2"
          title={`Switch to ${mapStyle === 'streets' ? 'satellite' : 'streets'} view`}
        >
          <Layers size={20} className="text-gray-700" />
          <span className="text-sm font-medium text-gray-700 capitalize">{mapStyle}</span>
        </button>

        {/* Reset Map Button */}
        <button
          onClick={onResetMap}
          className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors flex items-center justify-center"
          title="Reset map view and filters"
        >
          <RotateCcw size={20} className="text-gray-700" />
        </button>
      </div>

      {selectingFromMap && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
          <p className="text-sm font-medium text-gray-700">
            Click on the map to select {selectingFromMap}
          </p>
        </div>
      )}
    </div>
  );
}
