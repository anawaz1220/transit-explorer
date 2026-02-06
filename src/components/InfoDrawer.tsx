import { X, MapPin, Clock } from 'lucide-react';
import { RouteFeature, StopFeature } from '../types';
import { getRouteColor } from '../utils/colors';

interface InfoDrawerProps {
  isOpen: boolean;
  type: 'route' | 'stop' | null;
  route: RouteFeature | null;
  stop: StopFeature | null;
  stops: StopFeature[];
  onClose: () => void;
  onStopHover?: (stop: StopFeature | null) => void;
}

export default function InfoDrawer({
  isOpen,
  type,
  route,
  stop,
  stops,
  onClose,
  onStopHover,
}: InfoDrawerProps) {
  if (!isOpen || !type) return null;

  const getStopsForRoute = (routeNumber: number): StopFeature[] => {
    return stops.filter((s) => s.properties.route === String(routeNumber));
  };

  const formatTime = (time: string | null): string => {
    return time || '-';
  };

  return (
    <div className="fixed bottom-0 lg:bottom-0 lg:right-4 left-0 lg:left-auto w-full lg:w-96 lg:max-w-[calc(100vw-2rem)] bg-white rounded-t-2xl shadow-2xl z-50 animate-slide-in-up max-h-[70vh] flex flex-col">
      <div
        className="p-4 border-b flex items-center justify-between"
        style={
          type === 'route' && route
            ? { backgroundColor: getRouteColor(route.properties.Route), color: 'white' }
            : {}
        }
      >
        <h3 className="text-lg font-bold">
          {type === 'route' && route && `Route ${route.properties.Route}`}
          {type === 'stop' && stop && stop.properties.Name}
        </h3>
        <button
          onClick={onClose}
          className={`p-1 rounded-lg transition-colors ${
            type === 'route'
              ? 'hover:bg-white/20'
              : 'hover:bg-gray-100'
          }`}
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {type === 'route' && route && (
          <div>
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-1">Route Name</h4>
              <p className="text-gray-600">{route.properties.name}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Stops Along Route</h4>
              <div className="space-y-3">
                {getStopsForRoute(route.properties.Route).map((s, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 transition-colors cursor-pointer"
                    onMouseEnter={() => onStopHover?.(s)}
                    onMouseLeave={() => onStopHover?.(null)}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin size={16} className="text-primary-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{s.properties.Name}</p>
                      </div>
                    </div>
                    <div className="ml-6 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} className="text-gray-400" />
                        <div className="grid grid-cols-4 gap-2 flex-1">
                          <div>
                            <span className="text-xs text-gray-500">Time 1:</span>
                            <p className="font-medium text-gray-700">
                              {formatTime(s.properties.time1)}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Time 2:</span>
                            <p className="font-medium text-gray-700">
                              {formatTime(s.properties.time2)}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Time 3:</span>
                            <p className="font-medium text-gray-700">
                              {formatTime(s.properties.time3)}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Time 4:</span>
                            <p className="font-medium text-gray-700">
                              {formatTime(s.properties.time4)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {type === 'stop' && stop && (
          <div>
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-1">Route</h4>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getRouteColor(stop.properties.route) }}
                />
                <span className="text-gray-700">Route {stop.properties.route}</span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-1">Location</h4>
              <p className="text-sm text-gray-600">
                {stop.geometry.coordinates[1].toFixed(6)},{' '}
                {stop.geometry.coordinates[0].toFixed(6)}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Clock size={18} />
                Schedule Times
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Time 1</p>
                  <p className="text-lg font-bold text-gray-800">
                    {formatTime(stop.properties.time1)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Time 2</p>
                  <p className="text-lg font-bold text-gray-800">
                    {formatTime(stop.properties.time2)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Time 3</p>
                  <p className="text-lg font-bold text-gray-800">
                    {formatTime(stop.properties.time3)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Time 4</p>
                  <p className="text-lg font-bold text-gray-800">
                    {formatTime(stop.properties.time4)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
