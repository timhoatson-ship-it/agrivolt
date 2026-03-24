import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Lock, Filter, MapPin, Zap, Droplets, ChevronDown } from 'lucide-react';
import { cn, formatAud, formatKm, formatHa } from '@/lib/utils';
import { api } from '@/lib/api';
import type { GridProximityRating } from '@shared/types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN';

interface AnonymizedProperty {
  id: number;
  totalHectares: number;
  currentLandUse: string;
  interestLevel: string;
  region: string;
  gridDistanceKm: number | null;
  gridRating: string | null;
  lat: number;
  lng: number;
  label: string;
  registeredAt: string;
  locked: boolean;
}

export default function DeveloperDashboard() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<AnonymizedProperty | null>(null);
  const [filters, setFilters] = useState({
    maxGridDistance: 30,
    minHectares: 0,
    gridRating: 'all' as 'all' | GridProximityRating,
  });

  // Fetch anonymized properties from API
  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await api.getProperties();
      return res.data as AnonymizedProperty[] | undefined;
    },
  });

  const properties = propertiesData || [];

  // Filter properties
  const filtered = properties.filter(p => {
    if (p.gridDistanceKm && p.gridDistanceKm > filters.maxGridDistance) return false;
    if (p.totalHectares < filters.minHectares) return false;
    if (filters.gridRating !== 'all' && p.gridRating !== filters.gridRating) return false;
    return true;
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    import('mapbox-gl').then((mapboxgl) => {
      (mapboxgl as any).accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [149.1, -23.5],
        zoom: 6,
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.on('load', () => {
        // Add empty source — will be updated when properties load
        map.addSource('properties', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          cluster: true,
          clusterMaxZoom: 12,
          clusterRadius: 60,
        });

        // Cluster circles
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'properties',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step', ['get', 'point_count'],
              '#4ade80', 5,  // green < 5
              '#f59e0b', 15, // amber < 15
              '#22c55e',     // brand green 15+
            ],
            'circle-radius': [
              'step', ['get', 'point_count'],
              20, 5,
              30, 15,
              40,
            ],
            'circle-opacity': 0.7,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

        // Cluster count labels
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'properties',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-size': 13,
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          },
          paint: {
            'text-color': '#ffffff',
          },
        });

        // Individual property points (unclustered) — shown with lock icon
        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'properties',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'match', ['get', 'gridRating'],
              'green', '#22c55e',
              'amber', '#f59e0b',
              'red', '#ef4444',
              '#9ca3af',
            ],
            'circle-radius': 10,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.8,
          },
        });

        // Click handler for unclustered points
        map.on('click', 'unclustered-point', (e: any) => {
          if (!e.features?.[0]) return;
          const props = e.features[0].properties;
          setSelectedProperty({
            id: props.id,
            totalHectares: props.totalHectares,
            currentLandUse: props.currentLandUse,
            interestLevel: props.interestLevel,
            region: props.region,
            gridDistanceKm: props.gridDistanceKm,
            gridRating: props.gridRating,
            lat: props.lat,
            lng: props.lng,
            label: props.label,
            registeredAt: props.registeredAt,
            locked: true,
          });
        });

        // Zoom into cluster on click
        map.on('click', 'clusters', (e: any) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
          if (!features[0]) return;
          const clusterId = features[0].properties?.cluster_id;
          (map.getSource('properties') as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return;
            map.easeTo({ center: (features[0].geometry as any).coordinates, zoom });
          });
        });

        map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
        map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
      });

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map data when filtered properties change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('properties');
    if (!source) return;

    const geojson = {
      type: 'FeatureCollection' as const,
      features: filtered.map(p => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
        properties: {
          id: p.id,
          totalHectares: p.totalHectares,
          currentLandUse: p.currentLandUse,
          interestLevel: p.interestLevel,
          region: p.region,
          gridDistanceKm: p.gridDistanceKm,
          gridRating: p.gridRating,
          label: p.label,
          registeredAt: p.registeredAt,
          lat: p.lat,
          lng: p.lng,
        },
      })),
    };

    (source as any).setData(geojson);
  }, [filtered]);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0 z-20">
        <Link to="/" className="text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900 font-display">AgriVolt</span>
          <span className="text-xs text-gray-400">Developer Dashboard</span>
        </div>
        <div className="flex-1" />
        <div className="text-xs text-gray-500">
          {filtered.length} propert{filtered.length === 1 ? 'y' : 'ies'} available
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Filter sidebar */}
        <div className="w-72 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto shrink-0">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" /> Filters
          </h3>

          {/* Grid Distance */}
          <div className="mb-6">
            <label className="text-xs font-medium text-gray-600 block mb-2">
              Max grid distance: {filters.maxGridDistance}km
            </label>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={filters.maxGridDistance}
              onChange={e => setFilters(f => ({ ...f, maxGridDistance: Number(e.target.value) }))}
              className="w-full accent-brand-500"
            />
          </div>

          {/* Min Hectares */}
          <div className="mb-6">
            <label className="text-xs font-medium text-gray-600 block mb-2">
              Min property size: {filters.minHectares}ha
            </label>
            <input
              type="range"
              min={0}
              max={500}
              step={10}
              value={filters.minHectares}
              onChange={e => setFilters(f => ({ ...f, minHectares: Number(e.target.value) }))}
              className="w-full accent-brand-500"
            />
          </div>

          {/* Grid Rating */}
          <div className="mb-6">
            <label className="text-xs font-medium text-gray-600 block mb-2">
              Grid proximity rating
            </label>
            <select
              value={filters.gridRating}
              onChange={e => setFilters(f => ({ ...f, gridRating: e.target.value as any }))}
              className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
            >
              <option value="all">All ratings</option>
              <option value="green">Green (High viability)</option>
              <option value="amber">Amber (Moderate)</option>
              <option value="red">Red (Low viability)</option>
            </select>
          </div>

          {/* Anonymity notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-amber-800">Anonymized View</span>
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              Property locations are approximate (±2km).
              Unlock individual sites to see exact addresses and farmer contact details.
            </p>
          </div>

          {/* Property list */}
          <div className="mt-6 space-y-2">
            {filtered.slice(0, 20).map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProperty(p)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all text-sm',
                  selectedProperty?.id === p.id
                    ? 'bg-brand-50 border-brand-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <RatingDot rating={p.gridRating as GridProximityRating} />
                  <span className="font-medium text-gray-900">{p.label}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{formatHa(p.totalHectares)}</span>
                  {p.gridDistanceKm && <span>{formatKm(p.gridDistanceKm)} to grid</span>}
                </div>
              </button>
            ))}
            {filtered.length === 0 && !isLoading && (
              <p className="text-sm text-gray-400 text-center py-8">
                No properties match your filters.
              </p>
            )}
            {isLoading && (
              <p className="text-sm text-gray-400 text-center py-8">
                Loading properties...
              </p>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="absolute inset-0" />

          {/* Selected property card */}
          {selectedProperty && (
            <div className="absolute bottom-6 right-6 z-10 bg-white rounded-card shadow-assessment p-5 w-[340px] border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <RatingDot rating={selectedProperty.gridRating as GridProximityRating} />
                  <span className="text-sm font-semibold text-gray-900">{selectedProperty.label}</span>
                </div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 text-center">
                <div>
                  <div className="text-lg font-bold font-mono text-gray-900">
                    {formatHa(selectedProperty.totalHectares)}
                  </div>
                  <div className="text-xs text-gray-500">Property size</div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-gray-900">
                    {selectedProperty.gridDistanceKm
                      ? formatKm(selectedProperty.gridDistanceKm)
                      : '—'}
                  </div>
                  <div className="text-xs text-gray-500">To grid (approx)</div>
                </div>
              </div>

              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Land use</span>
                  <span className="text-gray-900">{selectedProperty.currentLandUse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Interest level</span>
                  <span className="text-gray-900 capitalize">{selectedProperty.interestLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Region</span>
                  <span className="text-gray-900">{selectedProperty.region}</span>
                </div>
              </div>

              {/* Locked CTA */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <Lock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500 mb-2">
                  Exact address, farmer contact, and full assessment are hidden.
                </p>
                <button className="btn-primary w-full text-sm">
                  Unlock Site — Contact Farmer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RatingDot({ rating }: { rating: GridProximityRating | null }) {
  const color = {
    green: 'bg-grid-green',
    amber: 'bg-grid-amber',
    red: 'bg-grid-red',
    grey: 'bg-grid-grey',
  }[rating || 'grey'];
  return <div className={cn('w-2.5 h-2.5 rounded-full', color)} />;
}
