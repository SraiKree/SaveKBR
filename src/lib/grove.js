/**
 * Grove design tokens.
 *
 * These mirror the `G` constant in _designs/direction-grove.jsx, plus the
 * map theme used by the stylised KBRMap. Centralising them here means
 * components, the leaflet popups, and inline SVG all reach for the same
 * values — change a hex here and the whole product follows.
 */
export const G = {
  bg: '#efece2',          // warm off-white (paper)
  surf: '#f7f5ec',        // raised surface
  white: '#ffffff',
  ink: '#1c211c',         // primary text
  inkSoft: '#56594f',
  inkMute: '#8a8d80',
  forest: '#2f4a32',      // primary brand / forest green
  forestDeep: '#1f3322',
  leaf: '#5e8b4a',        // success / resolved
  clay: '#cc5a3a',        // critical alert
  amber: '#d4a23a',       // active / warning
  line: 'rgba(28,33,28,0.10)',
  hairline: 'rgba(28,33,28,0.06)',
  ui: "'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

/** Map theme passed to `KBRMap` (in _designs/shared.jsx). */
export const groveMapTheme = {
  id: 'grove',
  land: '#e3dfcf',
  park: '#bccda1',
  parkStroke: '#6f8a4c',
  road: '#f4f1e4',
  roadStroke: '#cfc7ac',
  water: '#a7c6ca',
  contour: '#90a26a',
  grid: 'rgba(31,51,34,0.05)',
  label: '#2f4a32',
  sublabel: '#7a7a5e',
  pinCritical: '#cc5a3a',
  pinActive: '#d4a23a',
  pinResolved: '#5e8b4a',
  pinRing: '#ffffff',
  pinText: '#ffffff',
  me: '#2f4a32',
  meHalo: '#2f4a32',
};

/**
 * KBR National Park — geographic constants.
 *
 * KBR_CENTER  : the canonical centre of the park (used as the default map
 *               view and the reference point for proximity checks).
 * KBR_RADIUS_M: how close (metres) a reporter must be to the park boundary
 *               before their submission is accepted. 2 km gives a comfortable
 *               buffer that still excludes anyone across the city.
 */
export const KBR_CENTER = { lat: 17.4206, lng: 78.4193 };
export const KBR_RADIUS_M = 1500; // 1.5 km — enough to encompass the park + immediate surroundings

/**
 * Haversine distance in metres between two lat/lng points.
 */
export function haversineMetres(lat1, lng1, lat2, lng2) {
  const R = 6_371_000; // Earth radius in metres
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns true when the given coords are within KBR_RADIUS_M of the park
 * centre. Pass `null` / `undefined` to get `false` (GPS not yet resolved).
 */
export function isNearKBR(coords) {
  if (!coords) return false;
  return haversineMetres(coords.lat, coords.lng, KBR_CENTER.lat, KBR_CENTER.lng) <= KBR_RADIUS_M;
}

/** Map a severity string to its Grove accent colour. */
export function severityColor(severity) {
  if (severity === 'critical') return G.clay;
  if (severity === 'active') return G.amber;
  if (severity === 'resolved') return G.leaf;
  return G.amber;
}

/**
 * Translate an incoming incident `type` (the old "Radius" schema:
 * Medical SOS / Fire SOS / Safety SOS / etc.) into a Grove severity bucket.
 * Anything explicitly resolved becomes "resolved"; otherwise SOS-shaped
 * types become "critical", everything else "active".
 */
export function severityFromIncident(incident) {
  if (!incident) return 'active';
  if (incident.status === 'resolved') return 'resolved';
  if (incident.severity) return incident.severity;
  const t = (incident.type || '').toLowerCase();
  if (t.includes('sos') || t.includes('fire') || t.includes('medical')) return 'critical';
  return 'active';
}
