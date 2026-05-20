import { useState, useEffect, useRef } from 'react';
import { KBR_CENTER, KBR_RADIUS_M, haversineMetres } from '../lib/grove';

/**
 * Named zones within KBR National Park.
 * Polygons are [lat, lng] pairs, traced roughly from satellite imagery.
 */
const CAMPUS_ZONES = [
    {
        name: 'KBR Main Entrance',
        polygon: [
            [17.4155, 78.4175],
            [17.4155, 78.4210],
            [17.4140, 78.4210],
            [17.4140, 78.4175],
        ],
    },
    {
        name: 'KBR North Trail',
        polygon: [
            [17.4250, 78.4160],
            [17.4250, 78.4230],
            [17.4210, 78.4230],
            [17.4210, 78.4160],
        ],
    },
    {
        name: 'KBR South Trail',
        polygon: [
            [17.4170, 78.4160],
            [17.4170, 78.4230],
            [17.4140, 78.4230],
            [17.4140, 78.4160],
        ],
    },
    {
        name: 'KBR Core Forest',
        polygon: [
            [17.4240, 78.4180],
            [17.4240, 78.4240],
            [17.4175, 78.4240],
            [17.4175, 78.4180],
        ],
    },
    {
        name: 'KBR East Boundary',
        polygon: [
            [17.4230, 78.4225],
            [17.4230, 78.4270],
            [17.4170, 78.4270],
            [17.4170, 78.4225],
        ],
    },
];


/**
 * KBR Park bounding box — generous enough to encompass the full park.
 */
const CAMPUS_BOUNDS = {
    north: 17.4280,
    south: 17.4130,
    east:  78.4290,
    west:  78.4100,
};


/**
 * Ray-casting point-in-polygon test
 */
function pointInPolygon(lat, lng, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [yi, xi] = polygon[i];
        const [yj, xj] = polygon[j];
        const intersect =
            yi > lat !== yj > lat &&
            lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

function isOnCampus(lat, lng) {
    // Primary check: bounding box
    if (
        lat >= CAMPUS_BOUNDS.south &&
        lat <= CAMPUS_BOUNDS.north &&
        lng >= CAMPUS_BOUNDS.west &&
        lng <= CAMPUS_BOUNDS.east
    ) return true;
    // Secondary: within KBR_RADIUS_M of the park centre (catches slightly
    // irregular park shapes that fall outside the bounding box).
    return haversineMetres(lat, lng, KBR_CENTER.lat, KBR_CENTER.lng) <= KBR_RADIUS_M;
}

function resolveZone(lat, lng) {
    for (const zone of CAMPUS_ZONES) {
        if (pointInPolygon(lat, lng, zone.polygon)) {
            return zone.name;
        }
    }
    if (isOnCampus(lat, lng)) return 'Inside KBR Park';
    // Compute distance for "Near KBR" label
    const dist = haversineMetres(lat, lng, KBR_CENTER.lat, KBR_CENTER.lng);
    if (dist <= KBR_RADIUS_M) return 'Near KBR Park';
    return 'Outside KBR Park area';
}

function accuracyLabel(meters) {
    if (meters == null) return 'Unknown';
    if (meters <= 10) return 'High';
    if (meters <= 30) return 'Medium';
    return 'Low';
}

/**
 * useLocation — watches the user's real GPS position and resolves
 * it to a named campus zone (or "Off Campus").
 *
 * Returns { zone, accuracy, status, coords, error }
 *   status: 'requesting' | 'active' | 'denied' | 'unavailable' | 'error'
 */
export function useLocation() {
    const [state, setState] = useState({
        zone: null,
        accuracy: null,
        status: 'requesting',
        coords: null,
        error: null,
    });
    const watchId = useRef(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setState(s => ({
                ...s,
                status: 'unavailable',
                zone: 'Location unavailable',
                error: 'Geolocation not supported by this browser',
            }));
            return;
        }

        watchId.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude: lat, longitude: lng, accuracy } = pos.coords;
                setState({
                    zone: resolveZone(lat, lng),
                    accuracy: accuracyLabel(accuracy),
                    status: 'active',
                    coords: { lat, lng },
                    error: null,
                });
            },
            (err) => {
                const denied = err.code === err.PERMISSION_DENIED;
                setState(s => ({
                    ...s,
                    status: denied ? 'denied' : 'error',
                    zone: denied ? 'Location access denied' : 'Location error',
                    error: err.message,
                }));
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10_000,
                timeout: 15_000,
            }
        );

        return () => {
            if (watchId.current != null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
    }, []);

    return state;
}
