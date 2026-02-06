import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import InfoDrawer from './components/InfoDrawer';
import Toast from './components/Toast';
import { RouteFeature, StopFeature, LocationPoint, RouteCollection, StopCollection, PlannedRoute } from './types';
import { findNearestStop } from './utils/routeCalculator';
import { getRouteBetweenPoints, formatDistance, formatDuration } from './utils/routing';

function App() {
  const [routes, setRoutes] = useState<RouteFeature[]>([]);
  const [stops, setStops] = useState<StopFeature[]>([]);
  const [visibleRoutes, setVisibleRoutes] = useState<Set<number>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);
  const [infoDrawerType, setInfoDrawerType] = useState<'route' | 'stop' | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteFeature | null>(null);
  const [selectedStop, setSelectedStop] = useState<StopFeature | null>(null);

  const [plannedRoute, setPlannedRoute] = useState<PlannedRoute | null>(null);

  const [selectingFromMap, setSelectingFromMap] = useState<'origin' | 'destination' | null>(null);
  const [tempOrigin, setTempOrigin] = useState<LocationPoint | null>(null);
  const [tempDestination, setTempDestination] = useState<LocationPoint | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [hoveredStop, setHoveredStop] = useState<StopFeature | null>(null);
  const [shouldResetMapView, setShouldResetMapView] = useState(false);

  useEffect(() => {
    // Load routes
    fetch('/data/routes.geojson')
      .then((res) => res.json())
      .then((data: RouteCollection) => {
        setRoutes(data.features);
        // Show all routes by default
        const routeNumbers = new Set(data.features.map((r) => r.properties.Route));
        setVisibleRoutes(routeNumbers);
      })
      .catch((err) => console.error('Error loading routes:', err));

    // Load stops
    fetch('/data/stops.geojson')
      .then((res) => res.json())
      .then((data: StopCollection) => {
        setStops(data.features);
      })
      .catch((err) => console.error('Error loading stops:', err));
  }, []);

  const handleToggleRoute = (routeId: number) => {
    setVisibleRoutes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(routeId)) {
        newSet.delete(routeId);
      } else {
        newSet.add(routeId);
      }
      return newSet;
    });
  };

  const handleRouteClick = (route: RouteFeature) => {
    setSelectedRoute(route);
    setSelectedStop(null);
    setInfoDrawerType('route');
    setInfoDrawerOpen(true);
  };

  const handleStopClick = (stop: StopFeature) => {
    setSelectedStop(stop);
    setSelectedRoute(null);
    setInfoDrawerType('stop');
    setInfoDrawerOpen(true);
  };

  const handlePlanRoute = async (origin: LocationPoint, destination: LocationPoint) => {
    try {
      // Get actual road-based route
      const roadRoute = await getRouteBetweenPoints(origin, destination);

      if (!roadRoute) {
        setToast({ message: 'Unable to find a route. Please try different locations.', type: 'error' });
        return;
      }

      // Find nearest stops
      const nearestOriginStop = findNearestStop(origin, stops);
      const nearestDestStop = findNearestStop(destination, stops);

      setPlannedRoute({
        origin,
        destination,
        roadRoute,
        nearestOriginStop: nearestOriginStop || undefined,
        nearestDestinationStop: nearestDestStop || undefined,
      });

      // Show success toast
      const routeInfo = nearestOriginStop
        ? `Closest bus route: Route ${nearestOriginStop.properties.route}`
        : 'No nearby bus stops found';

      setToast({
        message: `Route found! ${formatDistance(roadRoute.distance)}, ~${formatDuration(roadRoute.duration)}. ${routeInfo}`,
        type: 'success',
      });
    } catch (error) {
      console.error('Route planning error:', error);
      setToast({ message: 'Error planning route. Please try again.', type: 'error' });
    }
  };

  const handleClearRoute = () => {
    setPlannedRoute(null);
    setTempOrigin(null);
    setTempDestination(null);
  };

  const handleSelectFromMap = (type: 'origin' | 'destination') => {
    setSelectingFromMap(type);
  };

  const handleMapSelect = (location: LocationPoint) => {
    if (selectingFromMap === 'origin') {
      setTempOrigin(location);
    } else if (selectingFromMap === 'destination') {
      setTempDestination(location);
    }
    setSelectingFromMap(null);
  };

  const handleResetMap = () => {
    // Reset all filters
    const routeNumbers = new Set(routes.map((r) => r.properties.Route));
    setVisibleRoutes(routeNumbers);

    // Clear planned route
    setPlannedRoute(null);
    setTempOrigin(null);
    setTempDestination(null);

    // Close drawer
    setInfoDrawerOpen(false);
    setSelectedRoute(null);
    setSelectedStop(null);

    // Clear hovered stop
    setHoveredStop(null);

    // Trigger map view reset
    setShouldResetMapView(true);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar
          isOpen={isSidebarOpen}
          routes={routes}
          stops={stops}
          visibleRoutes={visibleRoutes}
          onToggleRoute={handleToggleRoute}
          onRouteClick={handleRouteClick}
          onStopClick={handleStopClick}
          onPlanRoute={handlePlanRoute}
          onClearRoute={handleClearRoute}
          onSelectFromMap={handleSelectFromMap}
          mapSelectedOrigin={tempOrigin}
          mapSelectedDestination={tempDestination}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 relative">
          <Map
            routes={routes}
            stops={stops}
            visibleRoutes={visibleRoutes}
            onRouteClick={handleRouteClick}
            onStopClick={handleStopClick}
            selectedRoute={selectedRoute}
            selectedStop={selectedStop}
            plannedRoute={plannedRoute}
            selectingFromMap={selectingFromMap}
            onMapSelect={handleMapSelect}
            tempOrigin={tempOrigin}
            tempDestination={tempDestination}
            hoveredStop={hoveredStop}
            onResetMap={handleResetMap}
            shouldResetMapView={shouldResetMapView}
            onMapViewReset={() => setShouldResetMapView(false)}
          />
        </div>
      </div>
      <InfoDrawer
        isOpen={infoDrawerOpen}
        type={infoDrawerType}
        route={selectedRoute}
        stop={selectedStop}
        stops={stops}
        onClose={() => setInfoDrawerOpen(false)}
        onStopHover={setHoveredStop}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
