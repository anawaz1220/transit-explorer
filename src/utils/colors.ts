export const ROUTE_COLORS: { [key: string]: string } = {
  '40': '#FF6B6B',
  '94': '#4ECDC4',
  '1': '#95E1D3',
  '2': '#FFD93D',
  '3': '#6BCB77',
  '4': '#A78BFA',
  '5': '#FB923C',
  '6': '#F472B6',
  '7': '#38BDF8',
  '8': '#FDE047',
};

export function getRouteColor(routeNumber: string | number): string {
  const key = String(routeNumber);
  return ROUTE_COLORS[key] || '#94A3B8';
}
