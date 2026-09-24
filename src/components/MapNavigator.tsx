import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Search,
  Layers,
  Settings,
  X,
  Compass,
  Train,
  Footprints,
  RefreshCw,
  Eye,
  Check,
  Building2,
  Clock,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { TransactionRecord } from '../types';
import { OneMapSettingsModal } from './OneMapSettingsModal';
import { getNearestMRTStation, NearestMRTResult } from '../utils/mrtStations';

export const TOWN_CENTERS: Record<string, [number, number]> = {
  'ANG MO KIO': [1.3691, 103.8454],
  'BEDOK': [1.3236, 103.9273],
  'BISHAN': [1.3508, 103.8482],
  'BUKIT BATOK': [1.3590, 103.7518],
  'BUKIT MERAH': [1.2819, 103.8239],
  'BUKIT PANJANG': [1.3774, 103.7719],
  'BUKIT TIMAH': [1.3294, 103.7763],
  'CENTRAL AREA': [1.2850, 103.8500],
  'CHOA CHU KANG': [1.3840, 103.7470],
  'CLEMENTI': [1.3162, 103.7649],
  'GEYLANG': [1.3201, 103.8918],
  'HOUGANG': [1.3713, 103.8915],
  'JURONG EAST': [1.3329, 103.7436],
  'JURONG WEST': [1.3404, 103.7090],
  'KALLANG/WHAMPOA': [1.3100, 103.8651],
  'MARINE PARADE': [1.3020, 103.9073],
  'PASIR RIS': [1.3721, 103.9474],
  'PUNGGOL': [1.4053, 103.9022],
  'QUEENSTOWN': [1.2942, 103.8060],
  'SEMBAWANG': [1.4491, 103.8185],
  'SENGKANG': [1.3868, 103.8914],
  'SERANGOON': [1.3554, 103.8679],
  'TAMPINES': [1.3533, 103.9452],
  'TOA PAYOH': [1.3343, 103.8563],
  'WOODLANDS': [1.4382, 103.7890],
  'YISHUN': [1.4304, 103.8354],
};

/**
 * Finds the nearest HDB town given lat/lng coordinates in Singapore
 */
export function findNearestTown(lat: number, lng: number): { town: string; distanceKm: number } {
  let nearestTown = 'TAMPINES';
  let minDistance = Infinity;

  for (const [townName, [tLat, tLng]] of Object.entries(TOWN_CENTERS)) {
    const dLat = (lat - tLat) * 111.0;
    const dLng = (lng - tLng) * 110.97;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestTown = townName;
    }
  }

  return { town: nearestTown, distanceKm: minDistance };
}

const ONEMAP_BASEMAPS = {
  Default: {
    name: 'OneMap Default',
    url: 'https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png',
  },
  Grey: {
    name: 'OneMap Grey',
    url: 'https://www.onemap.gov.sg/maps/tiles/Grey/{z}/{x}/{y}.png',
  },
  Night: {
    name: 'OneMap Night',
    url: 'https://www.onemap.gov.sg/maps/tiles/Night/{z}/{x}/{y}.png',
  },
  Original: {
    name: 'OneMap Original',
    url: 'https://www.onemap.gov.sg/maps/tiles/Original/{z}/{x}/{y}.png',
  },
};

interface MapNavigatorProps {
  records: TransactionRecord[];
  town: string;
  flatType: string;
  maxBudget: number | null;
  selectedRecordId: string | number | null;
  onSelectRecord: (record: TransactionRecord | null) => void;
  onTownChange?: (newTown: string) => void;
  onVisibleRecordsChange?: (visibleIds: Set<string | number>) => void;
  filterToMapBounds?: boolean;
  onToggleFilterToMapBounds?: (val: boolean) => void;
}

interface GeocodedLocation {
  lat: number;
  lng: number;
  address: string;
  postal?: string;
}

// Generate Leaflet Marker DivIcon HTML
function createMarkerIcon(price: number, inBudget: boolean, isSelected: boolean) {
  const priceK = `$${(price / 1000).toFixed(0)}k`;
  const markerHtml = `
    <div class="cursor-pointer group select-none transition-transform duration-150 ${isSelected ? 'scale-120 z-50' : 'hover:scale-105'}">
      <div class="relative flex items-center justify-center">
        <div class="px-2 py-0.5 rounded-full text-[11px] font-bold shadow-md border flex items-center gap-1 ${
          isSelected
            ? 'bg-indigo-600 text-white border-white ring-3 ring-indigo-400'
            : inBudget
            ? 'bg-emerald-600 text-white border-white ring-1 ring-emerald-700/30'
            : 'bg-slate-700 text-white border-slate-500 ring-1 ring-slate-800'
        }">
          <span>${priceK}</span>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${
          isSelected ? 'bg-indigo-600' : inBudget ? 'bg-emerald-600' : 'bg-slate-700'
        }"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'hdb-marker-icon',
    html: markerHtml,
    iconSize: [60, 26],
    iconAnchor: [30, 24],
    popupAnchor: [0, -22],
  });
}

// Generate Popup HTML with Flat Specs & Nearest MRT Station
function createPopupHtml(r: TransactionRecord, lat: number, lng: number, inBudget: boolean) {
  const mrtInfo = getNearestMRTStation(lat, lng);

  return `
    <div class="p-3.5 bg-white text-slate-800 text-xs w-72 select-text font-sans rounded-2xl">
      <!-- Location & Model Header -->
      <div class="pb-2 border-b border-slate-100">
        <div class="flex items-center justify-between gap-1 mb-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            ${r.flatType} · ${r.flatModel}
          </span>
          <span class="text-[10px] font-semibold ${inBudget ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'} px-1.5 py-0.5 rounded">
            ${inBudget ? 'Within Budget' : 'Over Budget'}
          </span>
        </div>
        <h4 class="font-bold text-slate-900 text-sm leading-snug">
          ${r.block ? `Blk ${r.block} ` : ''}${r.streetName}
        </h4>
        <div class="text-[11px] text-slate-500 mt-0.5">
          ${r.town} · Storey ${r.storeyRange}
        </div>
      </div>

      <!-- Basic Flat Specs Grid -->
      <div class="py-2.5 grid grid-cols-2 gap-2 text-xs border-b border-slate-100">
        <div>
          <span class="text-slate-400 text-[10px] uppercase font-semibold block">Resale Price</span>
          <span class="text-sm font-bold text-slate-900">$${r.resalePrice.toLocaleString()}</span>
          <span class="text-[10px] text-slate-500 block">$${r.pricePerSqm.toLocaleString()} / sqm</span>
        </div>
        <div>
          <span class="text-slate-400 text-[10px] uppercase font-semibold block">Floor Area</span>
          <span class="text-sm font-semibold text-slate-900">${r.floorAreaSqm} sqm</span>
          <span class="text-[10px] text-slate-500 block">~${r.floorAreaSqft} sqft</span>
        </div>
        <div class="col-span-2 pt-1 flex items-center justify-between text-[11px]">
          <span class="text-slate-500">Remaining Lease:</span>
          <span class="font-semibold text-slate-800">${r.remainingLeaseYears} yrs (${r.remainingLease})</span>
        </div>
      </div>

      <!-- Nearest MRT Station & Walking Minutes -->
      <div class="mt-2.5 p-2 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Nearest MRT Station</span>
          <span class="inline-flex items-center text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
            🚶 ${mrtInfo.walkingMinutes} mins walk
          </span>
        </div>
        <div class="text-xs font-bold text-slate-900 mt-1 flex items-center justify-between">
          <span>🚇 ${mrtInfo.station.name} MRT</span>
          <span class="text-[10px] font-semibold text-amber-800 bg-white px-1.5 py-0.5 rounded border border-amber-200">
            ${mrtInfo.station.code}
          </span>
        </div>
        <div class="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
          <span>${mrtInfo.station.line}</span>
          <span>~${mrtInfo.straightDistanceMeters}m away</span>
        </div>

        <button
          type="button"
          class="btn-walk-to-mrt mt-2 w-full py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
          data-lat="${mrtInfo.station.lat}"
          data-lng="${mrtInfo.station.lng}"
          data-name="${mrtInfo.station.name} MRT"
        >
          <span>Show Walking Route on Map</span>
        </button>
      </div>
    </div>
  `;
}

export const MapNavigator: React.FC<MapNavigatorProps> = ({
  records,
  town,
  flatType,
  maxBudget,
  selectedRecordId,
  onSelectRecord,
  onTownChange,
  onVisibleRecordsChange,
  filterToMapBounds = true,
  onToggleFilterToMapBounds,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const mrtMarkerRef = useRef<L.Marker | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);

  const isMapPannedRef = useRef<boolean>(false);
  const isUserDraggingRef = useRef<boolean>(false);
  const moveDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markersMapRef = useRef<Map<string | number, { marker: L.Marker; record: TransactionRecord; inBudget: boolean }>>(new Map());
  const selectedMarkerIdRef = useRef<string | number | null>(null);

  const [basemapStyle, setBasemapStyle] = useState<keyof typeof ONEMAP_BASEMAPS>('Default');
  const [inBudgetOnly, setInBudgetOnly] = useState(false);
  const [autoSyncArea, setAutoSyncArea] = useState(true);
  const [discoveredTown, setDiscoveredTown] = useState<string | null>(null);
  const [areaToast, setAreaToast] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(records.length);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeRoute, setActiveRoute] = useState<{
    summary?: string;
    distance?: string;
    time?: string;
    routeType?: string;
    destinationName?: string;
    instructions?: string[];
  } | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routingError, setRoutingError] = useState<string | null>(null);

  // Address geocoding cache: address string -> { lat, lng }
  const [coordsCache, setCoordsCache] = useState<Record<string, GeocodedLocation>>({});
  const [isGeocoding, setIsGeocoding] = useState(false);

  const townCenter = TOWN_CENTERS[town] || [1.3521, 103.8198];

  // Currently selected record
  const selectedRecord = useMemo(() => {
    return records.find((r) => r.id === selectedRecordId) || null;
  }, [records, selectedRecordId]);

  // Coordinates of selected flat
  const selectedCoords = useMemo(() => {
    if (!selectedRecord) return null;
    const fullAddr = `${selectedRecord.block ? `${selectedRecord.block} ` : ''}${selectedRecord.streetName}`.trim();
    const cached = coordsCache[fullAddr];
    if (cached && Number.isFinite(cached.lat) && Number.isFinite(cached.lng)) {
      return { lat: cached.lat, lng: cached.lng };
    }
    return { lat: townCenter[0], lng: townCenter[1] };
  }, [selectedRecord, coordsCache, townCenter]);

  // Nearest MRT Station to selected flat
  const nearestMRT = useMemo<NearestMRTResult | null>(() => {
    if (!selectedCoords) return null;
    return getNearestMRTStation(selectedCoords.lat, selectedCoords.lng);
  }, [selectedCoords]);

  // Compute which records are within visible map viewport
  const updateVisibleRecords = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    const visibleIds = new Set<string | number>();

    records.forEach((r, idx) => {
      const fullAddr = `${r.block ? `${r.block} ` : ''}${r.streetName}`.trim();
      const cached = coordsCache[fullAddr];
      let lat = townCenter[0];
      let lng = townCenter[1];

      if (cached && Number.isFinite(cached.lat) && Number.isFinite(cached.lng)) {
        lat = cached.lat;
        lng = cached.lng;
      } else {
        const angle = (idx / 35) * Math.PI * 2;
        const radius = 0.003 + (idx % 5) * 0.002;
        lat = townCenter[0] + Math.sin(angle) * radius;
        lng = townCenter[1] + Math.cos(angle) * (radius * 1.2);
      }

      if (bounds.contains([lat, lng])) {
        visibleIds.add(r.id);
      }
    });

    setVisibleCount(visibleIds.size);
    onVisibleRecordsChange?.(visibleIds);
  }, [records, coordsCache, townCenter, onVisibleRecordsChange]);

  // Request Route to Destination / MRT using OneMap Routing
  const requestRoute = useCallback(async (destLat: number, destLng: number, destName: string, mode: string = 'walk') => {
    if (!selectedCoords) return;

    setIsRouting(true);
    setRoutingError(null);

    const start = `${selectedCoords.lat},${selectedCoords.lng}`;
    const end = `${destLat},${destLng}`;

    // Plot destination marker for MRT
    if (mapRef.current) {
      if (mrtMarkerRef.current) mrtMarkerRef.current.remove();
      const mrtIcon = L.divIcon({
        className: 'mrt-pin',
        html: `
          <div class="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white ring-2 ring-amber-300">
            🚇
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      mrtMarkerRef.current = L.marker([destLat, destLng], { icon: mrtIcon })
        .addTo(mapRef.current)
        .bindPopup(`<strong>${destName}</strong>`)
        .openPopup();
    }

    try {
      const res = await fetch(`/api/onemap?action=route&start=${start}&end=${end}&routeType=${mode}`);
      const data = await res.json();

      if (!res.ok) {
        if (data.requiresToken) {
          const distKm = Math.round(L.latLng(selectedCoords.lat, selectedCoords.lng).distanceTo(L.latLng(destLat, destLng))) / 1000;
          const estMin = Math.max(1, Math.round((distKm / 4.5) * 60));

          setActiveRoute({
            summary: `Direct distance ~${(distKm * 1000).toFixed(0)}m (${estMin} mins walk to ${destName})`,
            distance: `${(distKm * 1000).toFixed(0)} m`,
            time: `~${estMin} mins`,
            routeType: mode,
            destinationName: destName,
            instructions: [
              `Direct walking path: ~${estMin} mins to ${destName}.`,
              'OneMap detailed turn-by-turn API is ready — mint or enter token in settings to view exact turn paths.',
            ],
          });
          drawStraightLineRoute([selectedCoords.lat, selectedCoords.lng], [destLat, destLng]);
          return;
        }
        throw new Error(data.error || 'Routing request failed');
      }

      if (data.route_geometry && mapRef.current) {
        const points = decodePolyline(data.route_geometry);
        if (routeLayerRef.current) {
          routeLayerRef.current.remove();
        }
        const polyline = L.polyline(points, {
          color: '#4f46e5',
          weight: 4,
          opacity: 0.85,
          dashArray: mode === 'walk' ? '4 8' : undefined,
        }).addTo(mapRef.current);
        routeLayerRef.current = polyline;
        mapRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      }

      setActiveRoute({
        summary: data.route_summary ? `${Math.round(data.route_summary.total_time / 60)} mins (${(data.route_summary.total_distance).toFixed(0)} m)` : `${destName}`,
        distance: data.route_summary ? `${data.route_summary.total_distance.toFixed(0)} m` : undefined,
        time: data.route_summary ? `${Math.round(data.route_summary.total_time / 60)} mins` : undefined,
        routeType: mode,
        destinationName: destName,
        instructions: data.route_instructions || [],
      });
    } catch (err: any) {
      setRoutingError(err.message || 'Routing failed');
    } finally {
      setIsRouting(false);
    }
  }, [selectedCoords]);

  const drawStraightLineRoute = (from: [number, number], to: [number, number]) => {
    if (!mapRef.current) return;
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
    }
    const line = L.polyline([from, to], {
      color: '#4f46e5',
      weight: 3,
      opacity: 0.75,
      dashArray: '5 7',
    }).addTo(mapRef.current);
    routeLayerRef.current = line;
    mapRef.current.fitBounds(line.getBounds(), { padding: [40, 40] });
  };

  function decodePolyline(str: string, precision = 5) {
    let index = 0, lat = 0, lng = 0, coordinates = [];
    let shift = 0, result = 0, byte = null, factor = Math.pow(10, precision);

    while (index < str.length) {
      byte = null; shift = 0; result = 0;
      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      let latitude_change = (result & 1) ? ~(result >> 1) : (result >> 1);
      shift = 0; result = 0;
      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      let longitude_change = (result & 1) ? ~(result >> 1) : (result >> 1);

      lat += latitude_change;
      lng += longitude_change;
      coordinates.push([lat / factor, lng / factor] as [number, number]);
    }
    return coordinates;
  }

  // Handle map movement end: updates visible records and detects town change only if user dragged
  const handleMapMoveEnd = useCallback(() => {
    if (!mapRef.current) return;

    // 1. Immediately update visible records for the current viewport
    updateVisibleRecords();

    // 2. Check if center of map has moved to another HDB town ONLY if user actively dragged the map
    if (isUserDraggingRef.current) {
      isUserDraggingRef.current = false;
      const center = mapRef.current.getCenter();
      const nearest = findNearestTown(center.lat, center.lng);

      if (nearest.town !== town) {
        if (autoSyncArea) {
          isMapPannedRef.current = true;
          setAreaToast(`Area changed to ${nearest.town}`);
          setTimeout(() => setAreaToast(null), 3000);
          onTownChange?.(nearest.town);
          setDiscoveredTown(null);
        } else {
          setDiscoveredTown(nearest.town);
        }
      } else {
        setDiscoveredTown(null);
      }
    }
  }, [town, autoSyncArea, onTownChange, updateVisibleRecords]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: townCenter,
      zoom: 14,
      maxZoom: 19,
      minZoom: 11,
      zoomControl: false,
      closePopupOnClick: false, // Prevent accidental dismissal on subtle map drag or click
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileLayer = L.tileLayer(ONEMAP_BASEMAPS[basemapStyle].url, {
      maxZoom: 19,
      attribution:
        'Map data © <a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a> | Singapore Land Authority',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);

    // Track user drag state to distinguish from programmatic flyTo
    map.on('dragstart', () => {
      isUserDraggingRef.current = true;
    });

    // When the user clicks an empty area of the map ("other area"), dismiss popup and widget
    map.on('click', () => {
      onSelectRecord(null);
      map.closePopup();
      if (routeLayerRef.current) routeLayerRef.current.remove();
      if (mrtMarkerRef.current) mrtMarkerRef.current.remove();
      setActiveRoute(null);
    });

    // Attach handler for the "Walk to MRT" button rendered inside the Leaflet popup
    map.on('popupopen', (e) => {
      const popupEl = e.popup.getElement();
      if (!popupEl) return;
      const walkBtn = popupEl.querySelector('.btn-walk-to-mrt') as HTMLButtonElement | null;
      if (walkBtn) {
        walkBtn.onclick = (event) => {
          event.stopPropagation();
          const lat = parseFloat(walkBtn.dataset.lat || '0');
          const lng = parseFloat(walkBtn.dataset.lng || '0');
          const name = walkBtn.dataset.name || 'MRT Station';
          requestRoute(lat, lng, name, 'walk');
        };
      }
    });

    map.on('moveend', () => {
      if (moveDebounceTimerRef.current) {
        clearTimeout(moveDebounceTimerRef.current);
      }
      moveDebounceTimerRef.current = setTimeout(() => {
        handleMapMoveEnd();
      }, 300);
    });

    mapRef.current = map;
    tileLayerRef.current = tileLayer;
    markersLayerRef.current = markersGroup;

    return () => {
      if (moveDebounceTimerRef.current) clearTimeout(moveDebounceTimerRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, [requestRoute]);

  // Update visible records when records or cache change
  useEffect(() => {
    updateVisibleRecords();
  }, [records, coordsCache, updateVisibleRecords]);

  // 2. Change Basemap
  useEffect(() => {
    if (!tileLayerRef.current || !mapRef.current) return;
    tileLayerRef.current.setUrl(ONEMAP_BASEMAPS[basemapStyle].url);
  }, [basemapStyle]);

  // 3. Pan to Town Center ONLY when changed from filter dropdown, NOT when user panned
  useEffect(() => {
    if (!mapRef.current) return;

    if (isMapPannedRef.current) {
      isMapPannedRef.current = false;
      return;
    }

    mapRef.current.flyTo(townCenter, 14, { duration: 1.2 });
  }, [town]);

  // 4. Batch Geocode Unique Addresses in Current Records
  useEffect(() => {
    const uniqueAddresses = Array.from(
      new Set(
        records.slice(0, 40).map((r) => {
          const blk = r.block ? `${r.block} ` : '';
          return `${blk}${r.streetName}`.trim();
        })
      )
    ).filter((addr) => !coordsCache[addr]);

    if (uniqueAddresses.length === 0) return;

    let isMounted = true;
    setIsGeocoding(true);

    const batchParam = encodeURIComponent(uniqueAddresses.join('|'));
    fetch(`/api/onemap?action=batchGeocode&addresses=${batchParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.results && Object.keys(data.results).length > 0) {
          setCoordsCache((prev) => ({
            ...prev,
            ...data.results,
          }));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsGeocoding(false);
      });

    return () => {
      isMounted = false;
    };
  }, [records, town]);

  // 5. Render Markers on Map (stable creation without selectedRecordId in dependencies)
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();
    markersMapRef.current.clear();
    selectedMarkerIdRef.current = null;

    const displayRecords = inBudgetOnly && maxBudget !== null
      ? records.filter((r) => r.resalePrice <= maxBudget)
      : records;

    displayRecords.slice(0, 40).forEach((r, idx) => {
      const fullAddr = `${r.block ? `${r.block} ` : ''}${r.streetName}`.trim();
      const cached = coordsCache[fullAddr];

      let lat = townCenter[0];
      let lng = townCenter[1];

      if (cached && Number.isFinite(cached.lat) && Number.isFinite(cached.lng)) {
        lat = cached.lat;
        lng = cached.lng;
      } else {
        const angle = (idx / 35) * Math.PI * 2;
        const radius = 0.003 + (idx % 5) * 0.002;
        lat = townCenter[0] + Math.sin(angle) * radius;
        lng = townCenter[1] + Math.cos(angle) * (radius * 1.2);
      }

      const inBudget = maxBudget === null || r.resalePrice <= maxBudget;
      const isSelected = selectedRecordId === r.id;

      const icon = createMarkerIcon(r.resalePrice, inBudget, isSelected);
      const marker = L.marker([lat, lng], { icon });

      // Embedded Rich Leaflet Popup Widget with flat specs and nearest MRT
      const popupHtml = createPopupHtml(r, lat, lng, inBudget);

      marker.bindPopup(popupHtml, {
        className: 'hdb-flat-popup',
        maxWidth: 320,
        minWidth: 280,
        autoClose: true,
        closeOnClick: false, // Prevents closing when clicking near or dragging
        closeButton: true,
        autoPan: true,
        autoPanPadding: [50, 50],
      });

      // Click event: select flat, open popup, and stop event from bubbling to map.on('click')
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectRecord(r);
        marker.openPopup();
      });

      markersMapRef.current.set(r.id, { marker, record: r, inBudget });
      layer.addLayer(marker);

      if (isSelected) {
        selectedMarkerIdRef.current = r.id;
        marker.setZIndexOffset(1000);
        setTimeout(() => marker.openPopup(), 50);
      }
    });
  }, [records, coordsCache, inBudgetOnly, maxBudget, townCenter, onSelectRecord]);

  // 6. Synchronize Selection without rebuilding markers (keeps popup open persistently)
  useEffect(() => {
    if (!mapRef.current) return;

    // 1. Revert previous selected marker style if changed
    if (selectedMarkerIdRef.current && selectedMarkerIdRef.current !== selectedRecordId) {
      const prev = markersMapRef.current.get(selectedMarkerIdRef.current);
      if (prev) {
        prev.marker.setIcon(createMarkerIcon(prev.record.resalePrice, prev.inBudget, false));
        prev.marker.setZIndexOffset(0);
      }
    }

    // 2. Highlight and open popup for new selected marker
    if (selectedRecordId) {
      const current = markersMapRef.current.get(selectedRecordId);
      if (current) {
        current.marker.setIcon(createMarkerIcon(current.record.resalePrice, current.inBudget, true));
        current.marker.setZIndexOffset(1000);
        current.marker.openPopup();

        // Softly center if marker is not well inside view bounds
        const latLng = current.marker.getLatLng();
        if (mapRef.current && !mapRef.current.getBounds().pad(-0.1).contains(latLng)) {
          mapRef.current.panTo(latLng, { animate: true, duration: 0.5 });
        }
      }
      selectedMarkerIdRef.current = selectedRecordId;
    } else {
      selectedMarkerIdRef.current = null;
      mapRef.current.closePopup();
    }
  }, [selectedRecordId]);

  // 7. Handle OneMap Search
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const res = await fetch(`/api/onemap?action=search&searchVal=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results.slice(0, 5));
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item: any) => {
    const lat = parseFloat(item.LATITUDE);
    const lng = parseFloat(item.LONGITUDE);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !mapRef.current) return;

    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }

    const searchIcon = L.divIcon({
      className: 'search-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-rose-300 animate-bounce">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const marker = L.marker([lat, lng], { icon: searchIcon })
      .addTo(mapRef.current)
      .bindPopup(`<strong>${item.BUILDING !== 'NIL' ? item.BUILDING : item.SEARCHVAL}</strong><br/><span class="text-xs">${item.ADDRESS}</span>`)
      .openPopup();

    searchMarkerRef.current = marker;
    mapRef.current.flyTo([lat, lng], 16, { duration: 1.0 });
    setSearchResults([]);

    const nearest = findNearestTown(lat, lng);
    if (nearest.town !== town && onTownChange) {
      isMapPannedRef.current = true;
      onTownChange(nearest.town);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Map Control Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-50 text-indigo-700">
              <Compass className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              OneMap Resale Navigator
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              SLA OneMap API
            </span>
            {isGeocoding && (
              <span className="text-[11px] text-slate-400 animate-pulse">
                · Geocoding blocks...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any property pin to view flat specifications, price/sqm, and walking minutes to the nearest MRT station
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dynamic Map Bounds List Sync Toggle */}
          {onToggleFilterToMapBounds && (
            <button
              type="button"
              onClick={() => onToggleFilterToMapBounds(!filterToMapBounds)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                filterToMapBounds
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Filter property transactions list to match map viewport"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visible Map Area ({visibleCount})</span>
            </button>
          )}

          {/* Auto-search as map moves Toggle */}
          <button
            type="button"
            onClick={() => setAutoSyncArea(!autoSyncArea)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              autoSyncArea
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Automatically load resale transactions as you pan to a new town"
          >
            {autoSyncArea ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <RefreshCw className="w-3.5 h-3.5 text-slate-400" />}
            <span>Auto-Search Area: {autoSyncArea ? 'ON' : 'OFF'}</span>
          </button>

          {/* Basemap Switcher */}
          <div className="inline-flex rounded-lg bg-white border border-slate-200 p-0.5 text-xs shadow-2xs">
            {(Object.keys(ONEMAP_BASEMAPS) as Array<keyof typeof ONEMAP_BASEMAPS>).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setBasemapStyle(mode)}
                className={`px-2 py-1 rounded-md font-medium transition-all ${
                  basemapStyle === mode
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Budget Only Filter Toggle */}
          {maxBudget !== null && (
            <button
              type="button"
              onClick={() => setInBudgetOnly(!inBudgetOnly)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                inBudgetOnly
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              In Budget
            </button>
          )}

          {/* Center Town Button */}
          <button
            type="button"
            onClick={() => mapRef.current?.flyTo(townCenter, 14, { duration: 1.0 })}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-colors"
            title={`Center on ${town}`}
          >
            <Navigation className="w-4 h-4" />
          </button>

          {/* OneMap Settings */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-colors"
            title="OneMap API Settings & Token Minting"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map + Search Container */}
      <div className="relative w-full h-[500px] sm:h-[560px]">
        {/* Floating Area Discovery Action Banner */}
        {discoveredTown && !autoSyncArea && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
            <button
              type="button"
              onClick={() => {
                isMapPannedRef.current = true;
                onTownChange?.(discoveredTown);
                setDiscoveredTown(null);
              }}
              className="px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 border-2 border-white ring-4 ring-indigo-400/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Search {discoveredTown} area</span>
            </button>
          </div>
        )}

        {/* Floating Area Toast when Auto-Sync triggers */}
        {areaToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-medium backdrop-blur-xs shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{areaToast}</span>
            </div>
          </div>
        )}

        {/* Search Bar Overlay */}
        <div className="absolute top-3 left-3 right-3 sm:right-auto sm:w-80 z-20">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search OneMap (e.g. MRT, Mall, Postal)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white/95 backdrop-blur-sm border border-slate-300 text-slate-900 shadow-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSearchResult(item)}
                  className="w-full p-2.5 text-left hover:bg-slate-50 transition-colors flex items-start gap-2 text-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-800">
                      {item.BUILDING !== 'NIL' ? item.BUILDING : item.SEARCHVAL}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      {item.ADDRESS}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Property Popup Information Widget (Persistent Card) */}
        {selectedRecord && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 z-20 max-w-xs sm:max-w-sm w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-4 animate-in fade-in slide-in-from-right-4 duration-200"
          >
            {/* Header: Location & Model */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {selectedRecord.flatType}
                  </span>
                  <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {selectedRecord.flatModel}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedRecord.block ? `Blk ${selectedRecord.block} ` : ''}
                  {selectedRecord.streetName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedRecord.town}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectRecord(null);
                  mapRef.current?.closePopup();
                  if (routeLayerRef.current) routeLayerRef.current.remove();
                  if (mrtMarkerRef.current) mrtMarkerRef.current.remove();
                  setActiveRoute(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close widget"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Basic Information Breakdown */}
            <div className="py-2.5 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Resale Price</span>
                <div className="text-base font-bold text-slate-900">
                  ${selectedRecord.resalePrice.toLocaleString()}
                </div>
                <div className="text-[11px] font-semibold text-indigo-700">
                  ${selectedRecord.pricePerSqm.toLocaleString()} / sqm
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Floor Area</span>
                <div className="text-sm font-semibold text-slate-800">
                  {selectedRecord.floorAreaSqm} sqm
                </div>
                <div className="text-[10px] text-slate-500">
                  ~{selectedRecord.floorAreaSqft} sqft
                </div>
              </div>

              <div className="col-span-2 pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Flat Storey:</span>
                <span className="font-semibold text-slate-900">
                  Storey {selectedRecord.storeyRange}
                </span>
              </div>

              <div className="col-span-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Remaining Lease:</span>
                <span className="font-semibold text-slate-900">
                  {selectedRecord.remainingLeaseYears} yrs ({selectedRecord.remainingLease})
                </span>
              </div>
            </div>

            {/* Nearest MRT Station & Walking Minutes Widget Card */}
            {nearestMRT && (
              <div className="mt-1 pt-2.5 border-t border-slate-100">
                <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                      <Train className="w-3.5 h-3.5 text-amber-700" />
                      Nearest MRT Station
                    </span>
                    <span className="font-bold text-xs text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-amber-800" />
                      {nearestMRT.walkingMinutes} mins walk
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-sm font-bold text-slate-900">
                      {nearestMRT.station.name} MRT
                    </span>
                    <span className="text-xs font-semibold text-amber-800 bg-white px-1.5 py-0.5 rounded border border-amber-200">
                      {nearestMRT.station.code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                    <span>{nearestMRT.station.line}</span>
                    <span>~${nearestMRT.straightDistanceMeters}m straight-line</span>
                  </div>

                  {/* Quick Action: Draw Walking Route to this MRT */}
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        requestRoute(
                          nearestMRT.station.lat,
                          nearestMRT.station.lng,
                          `${nearestMRT.station.name} MRT`,
                          'walk'
                        );
                      }}
                      disabled={isRouting}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 shadow-2xs disabled:opacity-50 cursor-pointer"
                    >
                      <Footprints className="w-3.5 h-3.5" />
                      <span>{isRouting ? 'Calculating...' : `Walk to ${nearestMRT.station.name} MRT`}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        requestRoute(1.2841, 103.8515, 'Raffles Place (CBD)', 'pt');
                      }}
                      disabled={isRouting}
                      className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors border border-slate-200 shadow-2xs cursor-pointer"
                      title="Route to Central Business District"
                    >
                      CBD Transit
                    </button>
                  </div>
                </div>

                {/* Active Route Details Banner */}
                {activeRoute && (
                  <div className="mt-2 p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-xs animate-in fade-in duration-150">
                    <div className="flex items-center justify-between font-semibold text-indigo-950">
                      <span>Route to {activeRoute.destinationName}:</span>
                      <span className="text-indigo-700">{activeRoute.distance}</span>
                    </div>
                    <div className="text-[11px] text-indigo-800 mt-0.5">
                      {activeRoute.summary}
                    </div>
                    {activeRoute.instructions && activeRoute.instructions.length > 0 && (
                      <div className="mt-1 text-[10px] text-slate-600 max-h-16 overflow-y-auto">
                        {activeRoute.instructions.slice(0, 2).map((inst, i) => (
                          <div key={i} className="truncate">• {inst}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {routingError && (
                  <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-700">
                    {routingError}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Map Legend Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-2xs"></span>
            <span>Within Budget</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-700 border border-white shadow-2xs"></span>
            <span>Over Budget</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-600 ring-2 ring-indigo-300"></span>
            <span>Selected Unit</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Showing <strong>{visibleCount}</strong> visible transactions · Click any property pin to pop up flat specs & nearest MRT walking minutes · Click outside/other area to dismiss
        </div>
      </div>

      {/* OneMap Settings & Token Modal */}
      <OneMapSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
