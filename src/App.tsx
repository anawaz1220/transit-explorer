import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import InfoDrawer from './components/InfoDrawer';
import Toast from './components/Toast';
import { RouteFeature, StopFeature, LocationPoint, RouteCollection, StopCollection, PlannedRoute, RouteMode } from './types';
import { findNearestStop } from './utils/routeCalculator';
import { getRouteBetweenPoints, formatDistance, formatDuration } from './utils/routing';

function App() {
  const [routes, setRoutes] = useState<RouteFeature[]>([]);
  const [stops, setStops] = useState<StopFeature[]>([]);
  const [visibleRoutes, setVisibleRoutes] = useState<Set<number>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);
  const [infoDrawerType, setInfoDrawerType] = useState<'route' | 'stop' | 'planned-route' | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteFeature | null>(null);
  const [selectedStop, setSelectedStop] = useState<StopFeature | null>(null);

  const [plannedRoute, setPlannedRoute] = useState<PlannedRoute | null>(null);
  const [routeMode, setRouteMode] = useState<RouteMode>('walking');

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
        // HIDE Route 40: Filter out Route 40 from the data
        const filteredRoutes = data.features.filter((r) => r.properties.Route !== 40);
        setRoutes(filteredRoutes);

        // Show all routes by default (excluding Route 40)
        const routeNumbers = new Set(filteredRoutes.map((r) => r.properties.Route));
        setVisibleRoutes(routeNumbers);
      })
      .catch((err) => console.error('Error loading routes:', err));

    // Load stops
    fetch('/data/stops.geojson')
      .then((res) => res.json())
      .then((data: StopCollection) => {
        // HIDE Route 40: Filter out stops that belong to Route 40
        const filteredStops = data.features.filter((s) => s.properties.route !== '40');
        setStops(filteredStops);
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

  const handlePlanRoute = async (origin: LocationPoint, destination: LocationPoint, mode?: RouteMode) => {
    try {
      const selectedMode = mode || routeMode;

      // Get actual road-based route
      const roadRoute = await getRouteBetweenPoints(origin, destination, selectedMode);

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
        mode: selectedMode,
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

  const handleRouteModeChange = async (mode: RouteMode) => {
    setRouteMode(mode);

    // If there's a planned route, recalculate it with the new mode
    if (plannedRoute) {
      await handlePlanRoute(plannedRoute.origin, plannedRoute.destination, mode);
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

  const handleShowToast = (message: string, type: 'success' | 'info' | 'error') => {
    setToast({ message, type });
  };

  const handlePlannedRouteClick = () => {
    if (plannedRoute) {
      setSelectedRoute(null);
      setSelectedStop(null);
      setInfoDrawerType('planned-route');
      setInfoDrawerOpen(true);
    }
  };

  const handleSetOrigin = (location: LocationPoint) => {
    setTempOrigin(location);
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
          onShowToast={handleShowToast}
          onSetOrigin={handleSetOrigin}
          plannedRoute={plannedRoute}
          routeMode={routeMode}
          onRouteModeChange={handleRouteModeChange}
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
            onPlannedRouteClick={handlePlannedRouteClick}
          />
        </div>
      </div>
      <InfoDrawer
        isOpen={infoDrawerOpen}
        type={infoDrawerType}
        route={selectedRoute}
        stop={selectedStop}
        stops={stops}
        plannedRoute={plannedRoute}
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
