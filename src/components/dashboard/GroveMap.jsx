import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { G, KBR_CENTER } from '../../lib/grove';
import { timeAgo, isHistorical } from '../../lib/timeUtils';
import { PhotoGallery } from '../common/PhotoGallery';

/* Patch Leaflet default icon URLs that 404 in bundlers */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/** #10b981 (emerald-500) — eco green per requirements 2.6 */
const ECO_GREEN = '#10b981';

const createEcoPin = (opacity = 1) =>
    L.divIcon({
        className: 'bg-transparent border-none',
        html: `
      <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;opacity:${opacity};">
        <div style="position:absolute;inset:0;border-radius:50%;background:${ECO_GREEN};opacity:0.18;"></div>
        <div style="width:16px;height:16px;border-radius:50%;background:${ECO_GREEN};border:2.5px solid #fff;box-shadow:0 4px 10px -4px rgba(16,185,129,0.5);"></div>
      </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });

const DEFAULT_CENTER = [KBR_CENTER.lat, KBR_CENTER.lng];
const DEFAULT_ZOOM = 16;

const MAX_BOUNDS = [
    [DEFAULT_CENTER[0] - 0.018, DEFAULT_CENTER[1] - 0.028],
    [DEFAULT_CENTER[0] + 0.018, DEFAULT_CENTER[1] + 0.028],
];

function MapCentreGuard() {
    const map = useMap();
    map.setMaxBounds(MAX_BOUNDS);
    return null;
}

/**
 * GroveMap — tree-felling patrol map.
 *
 * Props:
 *   reports       – array of rows from the `reports` table
 *   onResolve     – (id, oldStatus) → void
 *   onDismiss     – (id, oldStatus) → void
 *   isAdmin       – shows Resolve/Dismiss buttons when true
 */
function GroveMap({
    reports = [],
    onResolve,
    onDismiss,
    isAdmin = false,
    center = DEFAULT_CENTER,
    zoom = DEFAULT_ZOOM,
    className,
}) {
    const activeIcon = useMemo(() => createEcoPin(1), []);
    const histIcon = useMemo(() => createEcoPin(0.45), []);

    return (
        <div className={`w-full h-full relative overflow-hidden ${className ?? ''}`}>
            <MapContainer
                center={DEFAULT_CENTER}
                zoom={zoom}
                minZoom={14}
                maxZoom={19}
                maxBounds={MAX_BOUNDS}
                maxBoundsViscosity={1.0}
                zoomControl={false}
                scrollWheelZoom
                className="w-full h-full z-0"
                style={{ background: '#e3dfcf' }}
            >
                <MapCentreGuard />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {reports.map((report) => {
                    const hist = isHistorical(report.created_at);
                    return (
                        <Marker
                            key={report.id}
                            position={[report.lat, report.lng]}
                            icon={hist ? histIcon : activeIcon}
                        >
                            <Popup className="grove-popup">
                                <ReportPopup
                                    report={report}
                                    historical={hist}
                                    isAdmin={isAdmin}
                                    onResolve={onResolve}
                                    onDismiss={onDismiss}
                                />
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}

function ReportPopup({ report, historical, isAdmin, onResolve, onDismiss }) {
    return (
        <div className="w-60 -m-1 p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
                <span
                    className="inline-flex items-center gap-1 rounded-full text-[11px] font-semibold px-2 py-0.5"
                    style={{ background: `${ECO_GREEN}22`, color: ECO_GREEN }}
                >
                    <span
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: ECO_GREEN,
                            display: 'inline-block',
                        }}
                    />
                    Tree Felling
                    {historical && (
                        <span
                            className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{ background: `${G.inkMute}22`, color: G.inkMute }}
                        >
                            Historical
                        </span>
                    )}
                </span>
                <span className="font-mono text-[10.5px]" style={{ color: G.inkMute }}>
                    {timeAgo(report.created_at)}
                </span>
            </div>

            {/* Reporter name */}
            <p className="text-[13px] font-semibold leading-tight" style={{ color: G.ink }}>
                {report.reporter_name}
            </p>

            {/* Description */}
            <p
                className="text-[12px] mt-1 leading-snug"
                style={{
                    color: G.inkSoft,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}
            >
                {report.description || (
                    <em style={{ color: G.inkMute }}>No description</em>
                )}
            </p>

            {/* Photo thumbnails */}
            {report.photo_urls?.length > 0 && (
                <div className="mt-2">
                    <PhotoGallery urls={report.photo_urls} />
                </div>
            )}

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2">
                <Link
                    to={`/report/${report.id}`}
                    className="flex-1 text-center text-[12px] font-semibold text-white py-1.5 rounded-md"
                    style={{ background: ECO_GREEN }}
                >
                    Open report
                    <ChevronRight className="inline w-3 h-3 ml-0.5 -mt-0.5" />
                </Link>

                {isAdmin && report.status === 'active' && (
                    <>
                        <button
                            type="button"
                            onClick={() => onResolve?.(report.id, report.status)}
                            title="Mark resolved"
                            className="w-8 h-8 rounded-md border flex items-center justify-center flex-shrink-0"
                            style={{
                                borderColor: `${G.leaf}55`,
                                background: `${G.leaf}18`,
                                color: G.leaf,
                            }}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onDismiss?.(report.id, report.status)}
                            title="Dismiss report"
                            className="w-8 h-8 rounded-md border flex items-center justify-center flex-shrink-0"
                            style={{
                                borderColor: `${G.clay}55`,
                                background: `${G.clay}18`,
                                color: G.clay,
                            }}
                        >
                            <XCircle className="w-3.5 h-3.5" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default GroveMap;
