import { useState, useEffect } from 'react';
import { Search, MapPin, ChevronUp, ChevronDown, Navigation, X } from 'lucide-react';
import { RouteFeature, StopFeature, LocationPoint } from '../types';
import { getRouteColor } from '../utils/colors';
import { searchAddress, getCurrentLocation } from '../utils/geocoding';

interface SidebarProps {
  isOpen: boolean;
  routes: RouteFeature[];
  stops: StopFeature[];
  visibleRoutes: Set<number>;
  onToggleRoute: (routeId: number) => void;
  onRouteClick: (route: RouteFeature) => void;
  onStopClick: (stop: StopFeature) => void;
  onPlanRoute: (origin: LocationPoint, destination: LocationPoint) => void;
  onClearRoute: () => void;
  onSelectFromMap: (type: 'origin' | 'destination') => void;
  mapSelectedOrigin: LocationPoint | null;
  mapSelectedDestination: LocationPoint | null;
  onClose?: () => void;
}

export default function Sidebar({
  isOpen,
  routes,
  stops,
  visibleRoutes,
  onToggleRoute,
  onRouteClick,
  onStopClick,
  onPlanRoute,
  onClearRoute,
  onSelectFromMap,
  mapSelectedOrigin,
  mapSelectedDestination,
  onClose,
}: SidebarProps) {
  // Section visibility - Trip Planner expanded by default, others collapsed
  const [showTripPlanner, setShowTripPlanner] = useState(true);
  const [showRoutes, setShowRoutes] = useState(false);
  const [showStops, setShowStops] = useState(false);

  // Trip planner state
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [originResults, setOriginResults] = useState<LocationPoint[]>([]);
  const [destinationResults, setDestinationResults] = useState<LocationPoint[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<LocationPoint | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<LocationPoint | null>(null);

  // Stop search
  const [stopSearchQuery, setStopSearchQuery] = useState('');

  // Update inputs when map selection changes
  useEffect(() => {
    if (mapSelectedOrigin) {
      setSelectedOrigin(mapSelectedOrigin);
      setOriginQuery(mapSelectedOrigin.address || `${mapSelectedOrigin.lat.toFixed(4)}, ${mapSelectedOrigin.lng.toFixed(4)}`);
      setOriginResults([]);
    }
  }, [mapSelectedOrigin]);

  useEffect(() => {
    if (mapSelectedDestination) {
      setSelectedDestination(mapSelectedDestination);
      setDestinationQuery(mapSelectedDestination.address || `${mapSelectedDestination.lat.toFixed(4)}, ${mapSelectedDestination.lng.toFixed(4)}`);
      setDestinationResults([]);
    }
  }, [mapSelectedDestination]);

  // Search for origin addresses
  const handleOriginSearch = async (query: string) => {
    setOriginQuery(query);
    if (query.length < 3) {
      setOriginResults([]);
      return;
    }

    const results = await searchAddress(query);
    setOriginResults(results);
  };

  // Search for destination addresses
  const handleDestinationSearch = async (query: string) => {
    setDestinationQuery(query);
    if (query.length < 3) {
      setDestinationResults([]);
      return;
    }

    const results = await searchAddress(query);
    setDestinationResults(results);
  };

  // Select origin
  const handleSelectOrigin = (location: LocationPoint) => {
    setSelectedOrigin(location);
    setOriginQuery(location.address || '');
    setOriginResults([]);
  };

  // Select destination
  const handleSelectDestination = (location: LocationPoint) => {
    setSelectedDestination(location);
    setDestinationQuery(location.address || '');
    setDestinationResults([]);
  };

  // Use current location as origin
  const handleUseCurrentLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      handleSelectOrigin(location);
    }
  };

  // Plan route
  const handleSubmitRoute = () => {
    if (selectedOrigin && selectedDestination) {
      onPlanRoute(selectedOrigin, selectedDestination);
    }
  };

  // Clear route
  const handleClear = () => {
    setOriginQuery('');
    setDestinationQuery('');
    setOriginResults([]);
    setDestinationResults([]);
    setSelectedOrigin(null);
    setSelectedDestination(null);
    onClearRoute();
  };

  // Get unique route numbers
  const uniqueRoutes = Array.from(new Set(routes.map((r) => r.properties.Route)))
    .sort((a, b) => a - b)
    .map((routeNum) => routes.find((r) => r.properties.Route === routeNum)!);

  // Filter stops by search
  const filteredStops = stops.filter((stop) =>
    stop.properties.Name.toLowerCase().includes(stopSearchQuery.toLowerCase())
  );

  return (
    <div
      className={`${
        isOpen ? 'translate-y-0 lg:translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-y-0 lg:-translate-x-full lg:translate-x-0'
      } fixed lg:relative bottom-0 lg:top-0 left-0 lg:left-0 h-[85vh] lg:h-full w-full lg:w-80 bg-white shadow-lg z-20 transition-transform duration-300 flex flex-col rounded-t-2xl lg:rounded-none`}
    >
      {/* Mobile drag handle */}
      <div className="lg:hidden flex items-center justify-center py-2 border-b">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        <button
          onClick={onClose}
          className="absolute right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Plan Your Trip Section - Expanded by default */}
        <div className="border-b pb-4">
          <button
            onClick={() => setShowTripPlanner(!showTripPlanner)}
            className="flex items-center justify-between w-full text-left font-semibold text-lg mb-2"
          >
            <span>Plan Your Trip</span>
            {showTripPlanner ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showTripPlanner && (
            <div className="space-y-4">
              {/* Origin Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origin
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={originQuery}
                    onChange={(e) => handleOriginSearch(e.target.value)}
                    placeholder="Enter starting address..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Origin Results Dropdown */}
                {originResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {originResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectOrigin(result)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      >
                        {result.address}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleUseCurrentLocation}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Navigation size={14} />
                    Current location
                  </button>
                  <button
                    onClick={() => onSelectFromMap('origin')}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <MapPin size={14} />
                    Choose from map
                  </button>
                </div>
              </div>

              {/* Destination Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => handleDestinationSearch(e.target.value)}
                    placeholder="Enter destination address..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Destination Results Dropdown */}
                {destinationResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {destinationResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectDestination(result)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      >
                        {result.address}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => onSelectFromMap('destination')}
                  className="flex items-center gap-1 px-3 py-1 mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <MapPin size={14} />
                  Choose from map
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitRoute}
                  disabled={!selectedOrigin || !selectedDestination}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Find Route
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bus Routes Section - Collapsed by default */}
        <div className="border-b pb-4">
          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className="flex items-center justify-between w-full text-left font-semibold text-lg mb-2"
          >
            <span>Bus Routes</span>
            {showRoutes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showRoutes && (
            <div className="space-y-2">
              {uniqueRoutes.map((route) => (
                <div key={route.properties.Route} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`route-${route.properties.Route}`}
                    checked={visibleRoutes.has(route.properties.Route)}
                    onChange={() => onToggleRoute(route.properties.Route)}
                    className="w-4 h-4 rounded"
                  />
                  <label
                    htmlFor={`route-${route.properties.Route}`}
                    className="flex-1 flex items-center gap-2 cursor-pointer"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getRouteColor(route.properties.Route) }}
                    />
                    <span className="text-sm">Route {route.properties.Route}</span>
                    <span className="text-xs text-gray-500">({route.properties.name})</span>
                  </label>
                  <button
                    onClick={() => onRouteClick(route)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bus Stops Section - Collapsed by default */}
        <div>
          <button
            onClick={() => setShowStops(!showStops)}
            className="flex items-center justify-between w-full text-left font-semibold text-lg mb-2"
          >
            <span>Bus Stops</span>
            {showStops ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showStops && (
            <div className="space-y-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={stopSearchQuery}
                  onChange={(e) => setStopSearchQuery(e.target.value)}
                  placeholder="Search stops..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Stops List */}
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredStops.map((stop, idx) => (
                  <button
                    key={idx}
                    onClick={() => onStopClick(stop)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getRouteColor(stop.properties.route) }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{stop.properties.Name}</div>
                        <div className="text-xs text-gray-500">Route {stop.properties.route}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
