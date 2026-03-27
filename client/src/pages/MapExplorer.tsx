import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Layers, X, Search, Loader2, CheckCircle2, MapPin as MapPinIcon, MousePointerClick } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAud, formatKm, formatHa } from '@/lib/utils';
import {
  calculateLeaseEstimate,
  calculateWaterSavings,
  calculateShadePremium,
  getGridProximityRating,
  getOverallViability,
} from '@/lib/calculator';
import { api } from '@/lib/api';
import type { LandAssessment, GridProximityRating } from '@shared/types';
import gridConstraintsData from '@/data/grid-constraints.json';

// Mapbox token — replace with your own or set VITE_MAPBOX_TOKEN env var
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN';

// Geoscience Australia API endpoints
const GA_BASE = 'https://services.ga.gov.au/gis/rest/services/National_Electricity_Infrastructure/MapServer';
const GA_SUBSTATIONS = `${GA_BASE}/0/query?where=1%3D1&outFields=*&f=geojson&resultRecordCount=2000`;
// Note: Layer 2 maxRecordCount is 2000, response ~9MB. Request only needed fields.
const GA_TRANSMISSION = `${GA_BASE}/2/query?where=1%3D1&outFields=name,capacitykv,state&f=geojson&resultRecordCount=2000`;

// ArcGIS REST export endpoint for Strategic Cropping Land overlay
const QLD_SCL_EXPORT = 'https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Boundaries/AdminBoundariesFramework/MapServer/export';

// Flood zones — same AdminBoundariesFramework service, Layer 15
const QLD_FLOOD_EXPORT = QLD_SCL_EXPORT; // Same base URL

// Cadastral boundaries
const QLD_CADASTRAL = 'https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/LandParcelPropertyFramework/MapServer/export';

// Power stations — same GA service, Layer 1
const GA_POWERSTATIONS = `${GA_BASE}/1/query?where=1%3D1&outFields=name,primaryfueltype,generationmw,state&f=geojson&resultRecordCount=2000`;

// NSW spatial data endpoints
const NSW_CADASTRAL = 'https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Cadastre/MapServer/export';
const NSW_SAL_EXPORT = 'https://mapprod.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Additional_Layers/MapServer/export';

interface LayerConfig {
  id: string;
  label: string;
  visible: boolean;
  color: string;
  description: string;
}

const DEFAULT_LAYERS: LayerConfig[] = [
  { id: 'substations', label: 'Transmission Substations', visible: true, color: '#f59e0b', description: 'Major substations (Geoscience Australia)' },
  { id: 'transmission', label: 'Transmission Lines', visible: true, color: '#ef4444', description: 'High-voltage transmission lines' },
  { id: 'scl', label: 'Strategic Cropping Land', visible: false, color: '#a855f7', description: 'Strategic agricultural land overlays (QLD SCL + NSW SAL)' },
  { id: 'flood', label: 'Flood Zones (QFAO)', visible: false, color: '#3b82f6', description: 'Floodplain assessment overlays' },
  { id: 'cadastral', label: 'Property Boundaries', visible: false, color: '#6b7280', description: 'Property boundaries (zoom in to see)' },
  { id: 'powerstations', label: 'Power Stations', visible: false, color: '#8b5cf6', description: 'Major power stations (Geoscience Australia)' },
  { id: 'gridconstraints', label: 'Grid Constraints (DAPR)', visible: false, color: '#dc2626', description: 'Capacity-constrained substations (Energex/Ergon 2025)' },
];

async function fetchSolarData(lat: number, lng: number): Promise<{ solarMjM2: number; etMm: number }> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=Australia%2FBrisbane&past_days=365&forecast_days=1`
    );
    const data = await res.json();
    const radiationDays = data.daily?.shortwave_radiation_sum || [];
    const etDays = data.daily?.et0_fao_evapotranspiration || [];
    const validRadiation = radiationDays.filter((v: number) => v > 0);
    const avgSolarMjM2 = validRadiation.length > 0
      ? validRadiation.reduce((a: number, b: number) => a + b, 0) / validRadiation.length
      : 21.5;
    const validEt = etDays.filter((v: number) => v > 0);
    const avgEtMm = validEt.length > 0
      ? validEt.reduce((a: number, b: number) => a + b, 0) / validEt.length
      : 5.0;
    return { solarMjM2: Math.round(avgSolarMjM2 * 10) / 10, etMm: avgEtMm };
  } catch (err) {
    console.warn('Open-Meteo fetch failed:', err);
    return { solarMjM2: 21.5, etMm: 5.0 };
  }
}

export default function MapExplorer() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [layers, setLayers] = useState<LayerConfig[]>(DEFAULT_LAYERS);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [assessment, setAssessment] = useState<LandAssessment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Dynamic import for mapbox-gl to avoid SSR issues
    import('mapbox-gl').then((mapboxgl) => {
      (mapboxgl as any).accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [149.1, -23.5], // Central QLD
        zoom: 6,
        minZoom: 4,
        maxBounds: [[112, -44], [155, -10]], // All of mainland Australia
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }), 'top-right');

      map.on('load', async () => {
        setMapLoaded(true);
        setLoading(false);

        // Load substations
        try {
          const subsRes = await fetch(GA_SUBSTATIONS);
          const subsData = await subsRes.json();
          map.addSource('substations', { type: 'geojson', data: subsData });
          map.addLayer({
            id: 'substations-layer',
            type: 'circle',
            source: 'substations',
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 3, 10, 8, 15, 12],
              'circle-color': '#f59e0b',
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 1.5,
              'circle-opacity': 0.9,
            },
          });

          // Add substation labels
          map.addLayer({
            id: 'substations-labels',
            type: 'symbol',
            source: 'substations',
            minzoom: 8,
            layout: {
              'text-field': ['get', 'name'],
              'text-size': 11,
              'text-offset': [0, 1.5],
              'text-anchor': 'top',
            },
            paint: {
              'text-color': '#f59e0b',
              'text-halo-color': '#000000',
              'text-halo-width': 1,
            },
          });
        } catch (err) {
          console.warn('Failed to load substations:', err);
        }

        // Load transmission lines
        try {
          const transRes = await fetch(GA_TRANSMISSION);
          const transData = await transRes.json();
          console.log('[AgriVolt] Transmission lines loaded:', transData?.features?.length || 0, 'features');
          if (transData?.features?.length) {
            map.addSource('transmission', { type: 'geojson', data: transData });
            map.addLayer({
              id: 'transmission-layer',
              type: 'line',
              source: 'transmission',
              paint: {
                'line-color': '#ef4444',
                'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1.5, 8, 2.5, 12, 4],
                'line-opacity': 0.85,
              },
            });
            // Labels for transmission lines at zoom
            map.addLayer({
              id: 'transmission-labels',
              type: 'symbol',
              source: 'transmission',
              minzoom: 9,
              layout: {
                'text-field': ['concat', ['get', 'name'], ' (', ['get', 'capacitykv'], 'kV)'],
                'text-size': 10,
                'symbol-placement': 'line',
                'text-offset': [0, -0.8],
              },
              paint: {
                'text-color': '#ef4444',
                'text-halo-color': '#000000',
                'text-halo-width': 1,
              },
            });
          } else {
            console.warn('[AgriVolt] Transmission response had no features:', transData?.error);
          }
        } catch (err) {
          console.warn('Failed to load transmission lines:', err);
        }

        // Add ArcGIS REST export layer for Strategic Cropping Land (Layer 105)
        // Custom purple rendering via dynamicLayers — the default server style is
        // a pale transparent green that's invisible over satellite imagery.
        const sclDynamicLayers = JSON.stringify([{
          id: 105,
          source: { type: 'mapLayer', mapLayerId: 105 },
          drawingInfo: {
            renderer: {
              type: 'simple',
              symbol: {
                type: 'esriSFS',
                style: 'esriSFSSolid',
                color: [168, 85, 247, 255],  // #a855f7 purple
                outline: {
                  type: 'esriSLS',
                  style: 'esriSLSSolid',
                  color: [128, 50, 200, 255],
                  width: 1.5,
                },
              },
            },
          },
        }]);
        map.addSource('scl-arcgis', {
          type: 'raster',
          tiles: [
            `${QLD_SCL_EXPORT}?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png32&transparent=true&layers=show:105&dynamicLayers=${encodeURIComponent(sclDynamicLayers)}&f=image`,
          ],
          tileSize: 512,
        });
        map.addLayer({
          id: 'scl-layer',
          type: 'raster',
          source: 'scl-arcgis',
          paint: { 'raster-opacity': 0.7 },
          layout: { visibility: 'none' },
        });

        // Flood Zones (Layer 15) — same service as SCL, blue rendering
        const floodDynamicLayers = JSON.stringify([{
          id: 15,
          source: { type: 'mapLayer', mapLayerId: 15 },
          drawingInfo: {
            renderer: {
              type: 'simple',
              symbol: {
                type: 'esriSFS',
                style: 'esriSFSSolid',
                color: [59, 130, 246, 255], // #3b82f6 blue
                outline: {
                  type: 'esriSLS',
                  style: 'esriSLSSolid',
                  color: [37, 99, 235, 255],
                  width: 1,
                },
              },
            },
          },
        }]);
        map.addSource('flood-arcgis', {
          type: 'raster',
          tiles: [
            `${QLD_FLOOD_EXPORT}?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png32&transparent=true&layers=show:15&dynamicLayers=${encodeURIComponent(floodDynamicLayers)}&f=image`,
          ],
          tileSize: 512,
        });
        map.addLayer({
          id: 'flood-layer',
          type: 'raster',
          source: 'flood-arcgis',
          paint: { 'raster-opacity': 0.7 },
          layout: { visibility: 'none' },
        });

        // Cadastral Boundaries (Layer 4) — bold white outlines, zoom 13+
        const cadastralDynamicLayers = JSON.stringify([{
          id: 4,
          source: { type: 'mapLayer', mapLayerId: 4 },
          drawingInfo: {
            renderer: {
              type: 'simple',
              symbol: {
                type: 'esriSFS',
                style: 'esriSFSNull',  // No fill — outlines only
                outline: {
                  type: 'esriSLS',
                  style: 'esriSLSSolid',
                  color: [255, 255, 255, 255],  // Solid white
                  width: 2,
                },
              },
            },
          },
        }]);
        map.addSource('cadastral-arcgis', {
          type: 'raster',
          tiles: [
            `${QLD_CADASTRAL}?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png32&transparent=true&layers=show:4&dynamicLayers=${encodeURIComponent(cadastralDynamicLayers)}&f=image`,
          ],
          tileSize: 512,
        });
        map.addLayer({
          id: 'cadastral-layer',
          type: 'raster',
          source: 'cadastral-arcgis',
          minzoom: 13,
          paint: { 'raster-opacity': 1 },
          layout: { visibility: 'none' },
        });

        // Power Stations (GA Layer 1)
        try {
          const psRes = await fetch(GA_POWERSTATIONS);
          const psData = await psRes.json();
          map.addSource('powerstations', { type: 'geojson', data: psData });
          map.addLayer({
            id: 'powerstations-layer',
            type: 'circle',
            source: 'powerstations',
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 5, 10, 10, 15, 14],
              'circle-color': '#8b5cf6',
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2,
              'circle-opacity': 0.9,
            },
            layout: { visibility: 'none' },
          });
          map.addLayer({
            id: 'powerstations-labels',
            type: 'symbol',
            source: 'powerstations',
            minzoom: 8,
            layout: {
              'text-field': ['concat', ['get', 'name'], ' (', ['get', 'primaryfueltype'], ')'],
              'text-size': 10,
              'text-offset': [0, 1.8],
              'text-anchor': 'top',
              visibility: 'none',
            },
            paint: {
              'text-color': '#8b5cf6',
              'text-halo-color': '#000000',
              'text-halo-width': 1,
            },
          });
        } catch (err) {
          console.warn('Failed to load power stations:', err);
        }

        // Grid Constraints — DAPR 2025 constrained substations (Energex + Ergon)
        map.addSource('gridconstraints', {
          type: 'geojson',
          data: gridConstraintsData as any,
        });
        map.addLayer({
          id: 'gridconstraints-layer',
          type: 'circle',
          source: 'gridconstraints',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 6, 10, 12, 15, 18],
            'circle-color': '#dc2626',
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-opacity': 0.85,
          },
          layout: { visibility: 'none' },
        });
        map.addLayer({
          id: 'gridconstraints-labels',
          type: 'symbol',
          source: 'gridconstraints',
          minzoom: 8,
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 10,
            'text-offset': [0, 2],
            'text-anchor': 'top',
            visibility: 'none',
          },
          paint: {
            'text-color': '#dc2626',
            'text-halo-color': '#000000',
            'text-halo-width': 1,
          },
        });

        // NSW Strategic Agricultural Land (equivalent to QLD SCL)
        const nswSalDynamicLayers = JSON.stringify([{
          id: 9,
          source: { type: 'mapLayer', mapLayerId: 9 },
          drawingInfo: {
            renderer: {
              type: 'simple',
              symbol: {
                type: 'esriSFS',
                style: 'esriSFSSolid',
                color: [168, 85, 247, 255],
                outline: { type: 'esriSLS', style: 'esriSLSSolid', color: [128, 50, 200, 255], width: 1.5 },
              },
            },
          },
        }]);
        map.addSource('nsw-sal-arcgis', {
          type: 'raster',
          tiles: [
            `${NSW_SAL_EXPORT}?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png32&transparent=true&layers=show:9&dynamicLayers=${encodeURIComponent(nswSalDynamicLayers)}&f=image`,
          ],
          tileSize: 512,
        });
        map.addLayer({
          id: 'nsw-sal-layer',
          type: 'raster',
          source: 'nsw-sal-arcgis',
          paint: { 'raster-opacity': 0.7 },
          layout: { visibility: 'none' },
        });

        // NSW Cadastral Boundaries — white outlines like QLD
        const nswCadastralDynamicLayers = JSON.stringify([{
          id: 4,
          source: { type: 'mapLayer', mapLayerId: 4 },
          drawingInfo: {
            renderer: {
              type: 'simple',
              symbol: {
                type: 'esriSFS',
                style: 'esriSFSNull',
                outline: { type: 'esriSLS', style: 'esriSLSSolid', color: [255, 255, 255, 255], width: 2 },
              },
            },
          },
        }]);
        map.addSource('nsw-cadastral-arcgis', {
          type: 'raster',
          tiles: [
            `${NSW_CADASTRAL}?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png32&transparent=true&layers=show:4&dynamicLayers=${encodeURIComponent(nswCadastralDynamicLayers)}&f=image`,
          ],
          tileSize: 512,
        });
        map.addLayer({
          id: 'nsw-cadastral-layer',
          type: 'raster',
          source: 'nsw-cadastral-arcgis',
          minzoom: 13,
          paint: { 'raster-opacity': 1 },
          layout: { visibility: 'none' },
        });
      });

      // Click handler for pin-drop assessment
      map.on('click', (e: any) => {
        const { lng, lat } = e.lngLat;
        performAssessment(map, lat, lng);
      });

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Perform a land assessment at the clicked coordinates
  //
  // OPTIMIZATION (per Tim's review): We use centroid-to-point (click
  // location to substation) rather than polygon-to-multilinestring.
  // Polygon-to-line distance with complex QLD cadastral boundaries
  // would be computationally expensive in the browser. Centroid-based
  // is 100x faster and accurate enough for MVP lead qualification.
  //
  const performAssessment = useCallback(async (map: any, lat: number, lng: number) => {
    // Get substations source data for point-to-point distance calculation
    const subsSource = map.getSource('substations');
    if (!subsSource) return;

    const subsData = subsSource._data || subsSource.serialize()?.data;
    if (!subsData?.features) return;

    // Find nearest substation using haversine (point-to-point, centroid-first)
    // The click location acts as the property centroid — fast & sufficient for MVP
    let nearestDist = Infinity;
    let nearestSub: any = null;

    for (const feature of subsData.features) {
      if (!feature.geometry?.coordinates) continue;
      const [subLng, subLat] = feature.geometry.coordinates;
      const dist = haversineKm(lat, lng, subLat, subLng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestSub = feature;
      }
    }

    const gridRating = getGridProximityRating(nearestDist);

    // Check if nearest substation is grid-constrained (DAPR 2025 data)
    let gridConstraintWarning: string | null = null;
    const constraintFeatures = (gridConstraintsData as any).features || [];
    for (const cf of constraintFeatures) {
      if (!cf.geometry?.coordinates) continue;
      const [cLng, cLat] = cf.geometry.coordinates;
      const cDist = haversineKm(lat, lng, cLat, cLng);
      if (cDist < 30) { // Within 30km of a constrained substation
        const cName = cf.properties?.name || 'Unknown';
        const cNetwork = cf.properties?.network || '';
        const cLimitations = cf.properties?.limitations || '';
        gridConstraintWarning = `Nearest constrained substation: ${cName} (${cNetwork}, ${Math.round(cDist)}km away). Limitation: ${cLimitations || 'Capacity constrained'}. Grid connection may require network augmentation.`;
        break;
      }
    }

    // For MVP, use a default property size (will be replaced by cadastral lookup)
    const totalHectares = 50; // Default assumption
    const isScl = false; // Would query SCL layer
    const isFlood = false; // Would query flood layer

    const leaseEstimate = calculateLeaseEstimate(totalHectares, nearestDist, isScl, isFlood);

    // Fetch real solar data for this location
    const solarData = await fetchSolarData(lat, lng);
    const annualEvaporationMm = solarData.etMm * 365;
    const waterSavings = calculateWaterSavings(leaseEstimate.usableHectares, annualEvaporationMm);
    const shadePremium = calculateShadePremium();
    const overallViability = getOverallViability(gridRating, isScl, isFlood);

    const assessmentResult: LandAssessment = {
      coordinates: { lat, lng },
      totalHectares,
      nearestSubstation: {
        name: nearestSub?.properties?.name || 'Unknown',
        distanceKm: Math.round(nearestDist * 10) / 10,
        rating: gridRating,
        coordinates: {
          lat: nearestSub?.geometry?.coordinates?.[1] || 0,
          lng: nearestSub?.geometry?.coordinates?.[0] || 0,
        },
      },
      nearestTransmissionLine: {
        distanceKm: 0, // TODO: calculate from line geometry
        rating: gridRating,
      },
      constraints: {
        strategicCroppingLand: isScl,
        floodZone: isFlood,
        koalaHabitat: false,
        otherConstraints: [],
      },
      solarExposure: {
        annualAvgMjM2: solarData.solarMjM2,
        monthlyAvgMjM2: [25.5, 23.8, 21.2, 17.8, 14.5, 12.8, 13.5, 16.2, 19.8, 22.5, 24.8, 25.8],
      },
      leaseEstimate,
      waterSavings,
      shadePremium,
      overallViabilityScore: overallViability,
      gridConstraintWarning: gridConstraintWarning || undefined,
      assessedAt: new Date().toISOString(),
    };

    setAssessment(assessmentResult);
    setShowPrompt(false);

    // Add/move marker on map
    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.agrivolt-marker');
    existingMarkers.forEach(m => m.remove());

    import('mapbox-gl').then((mapboxgl) => {
      const el = document.createElement('div');
      el.className = 'agrivolt-marker';
      el.style.cssText = `
        width: 24px; height: 24px;
        background: ${ratingColor(gridRating)};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      `;
      new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);
    });
  }, []);

  // Toggle layer visibility
  const toggleLayer = (layerId: string) => {
    setLayers(prev =>
      prev.map(l => (l.id === layerId ? { ...l, visible: !l.visible } : l))
    );

    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Map of layer IDs to all Mapbox layer IDs that should toggle together
    const layerGroups: Record<string, string[]> = {
      'scl': ['scl-layer', 'nsw-sal-layer'],
      'cadastral': ['cadastral-layer', 'nsw-cadastral-layer'],
      'flood': ['flood-layer'],
      'substations': ['substations-layer', 'substations-labels'],
      'transmission': ['transmission-layer', 'transmission-labels'],
      'powerstations': ['powerstations-layer', 'powerstations-labels'],
      'gridconstraints': ['gridconstraints-layer', 'gridconstraints-labels'],
    };

    const layerIds = layerGroups[layerId] || [`${layerId}-layer`];

    for (const lid of layerIds) {
      if (!map.getLayer(lid)) continue;
      const current = map.getLayoutProperty(lid, 'visibility');
      const newVis = current === 'visible' ? 'none' : 'visible';
      map.setLayoutProperty(lid, 'visibility', newVis);
    }

    // Also toggle labels if they exist and aren't already in the group
    const labelsId = `${layerId}-labels`;
    if (map.getLayer(labelsId) && !layerGroups[layerId]?.includes(labelsId)) {
      const current = map.getLayoutProperty(labelsId, 'visibility');
      const newVis = current === 'visible' ? 'none' : 'visible';
      map.setLayoutProperty(labelsId, 'visibility', newVis);
    }
  };

  // Search handler (Mapbox Geocoding)
  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapRef.current) return;
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?country=au&access_token=${MAPBOX_TOKEN}`
      );
      const data = await res.json();
      if (data.features?.length) {
        const [lng, lat] = data.features[0].center;
        mapRef.current.flyTo({ center: [lng, lat], zoom: 13 });
        performAssessment(mapRef.current, lat, lng);
      }
    } catch (err) {
      console.warn('Geocoding failed:', err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Top bar */}
      <div className="h-14 bg-gray-950 border-b border-gray-800 flex items-center px-4 gap-2 sm:gap-4 shrink-0 z-20">
        <Link to="/" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white font-display">AgriVolt</span>
          <span className="text-xs text-gray-500 hidden sm:inline">Explorer</span>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-lg mx-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search address or town in Australia..."
            className="w-full h-9 pl-10 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>

        <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors text-xs font-medium hidden sm:inline">
          Developers
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-400 hover:text-white transition-colors p-2"
          title="Toggle layers"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        {/* Layer sidebar */}
        <div
          className={cn(
            'bg-gray-950 border-r border-gray-800 p-4 overflow-y-auto shrink-0 transition-all duration-300 z-30',
            sidebarOpen 
              ? 'w-72 translate-x-0' 
              : '-translate-x-full w-0',
            'absolute h-full lg:relative'
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Layers</h3>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white lg:hidden">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {layers.map(layer => (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all',
                  layer.visible
                    ? 'bg-gray-800 border-brand-500/30'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn('w-3 h-3 rounded-full', layer.visible ? 'opacity-100' : 'opacity-30')}
                    style={{ backgroundColor: layer.color }}
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{layer.label}</div>
                    <div className="text-xs text-gray-500">{layer.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Grid Proximity</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-grid-green" />
                <span>&lt; 5km — High viability</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-grid-amber" />
                <span>5–15km — Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-grid-red" />
                <span>15–30km — Low viability</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-grid-grey" />
                <span>&gt; 30km — Not viable</span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-gray-600">
            Click anywhere on the map to assess that location. Data coverage varies by state.
          </p>
        </div>

        {sidebarOpen && (
          <div className="absolute inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="absolute inset-0" />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80 z-10">
              <div className="flex items-center gap-3 text-white">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading map data...</span>
              </div>
            </div>
          )}

          {/* Getting started prompt — shown until first interaction */}
          {showPrompt && !loading && !assessment && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[340px] max-w-[calc(100%-2rem)]">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                    <MousePointerClick className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900">Find your property</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Search for your address above, or click anywhere on the map to drop a pin. We'll instantly show you a solar lease estimate for that location.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Search className="w-3 h-3" />
                    <span>Search address</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPinIcon className="w-3 h-3" />
                    <span>Click to drop pin</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assessment card overlay */}
          {assessment && (
            <AssessmentCard
              assessment={assessment}
              onClose={() => setAssessment(null)}
              onRegister={() => setShowRegistrationModal(true)}
            />
          )}

          {/* Registration modal */}
          {showRegistrationModal && assessment && (
            <RegistrationModal
              assessment={assessment}
              onClose={() => setShowRegistrationModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// --- Assessment Card Component ---

function AssessmentCard({ assessment, onClose, onRegister }: { assessment: LandAssessment; onClose: () => void; onRegister: () => void }) {
  const rating = assessment.overallViabilityScore;

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-10 assessment-card w-auto sm:w-[360px] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RatingBadge rating={rating} />
          <span className="text-xs text-gray-500">
            {formatKm(assessment.nearestSubstation.distanceKm)} from {assessment.nearestSubstation.name}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900 font-mono">
            {formatAud(assessment.leaseEstimate.annualIncomeAud)}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Annual lease</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-brand-600 font-mono">
            {assessment.waterSavings.annualSavingsMl}ML
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Water saved/yr</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-solar-amber font-mono">
            {assessment.solarExposure.annualAvgMjM2}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">MJ/m²/day</div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2 text-sm">
        <DetailRow label="Usable hectares" value={formatHa(assessment.leaseEstimate.usableHectares)} />
        <DetailRow label="Lease rate" value={`${formatAud(assessment.leaseEstimate.leaseRatePerHa)}/ha/yr`} />
        <DetailRow label="25-year total" value={formatAud(assessment.leaseEstimate.totalLifetimeIncomeAud)} highlight />
        <DetailRow label="Typical grazing lease" value="$35–75/ha/yr" />
        <DetailRow label="Water cost savings" value={`${formatAud(assessment.waterSavings.annualCostSavingsAud)}/yr`} />
        <DetailRow label="Evaporation reduction" value={`${assessment.waterSavings.evaporationReductionPct}%`} />
        <DetailRow label="Slashing cost avoided" value="$100–250/ha/yr" />
      </div>

      {/* Constraints */}
      {(assessment.constraints.strategicCroppingLand || assessment.constraints.floodZone) && (
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="text-xs font-semibold text-amber-800 mb-1">Constraint flags</div>
          {assessment.constraints.strategicCroppingLand && (
            <div className="text-xs text-amber-700">• Strategic Cropping Land (planning restrictions apply)</div>
          )}
          {assessment.constraints.floodZone && (
            <div className="text-xs text-amber-700">• Flood zone (elevated panels recommended)</div>
          )}
        </div>
      )}

      {/* Grid constraint warning */}
      {assessment.gridConstraintWarning && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-xs font-semibold text-red-800 mb-1">⚠ Grid Capacity Warning</div>
          <p className="text-xs text-red-700 leading-relaxed">
            {assessment.gridConstraintWarning}
          </p>
          <p className="text-[10px] text-red-500 mt-1">Source: Energy Queensland DAPR 2025</p>
        </div>
      )}

      {/* CTA */}
      <button onClick={onRegister} className="btn-primary w-full mt-4 text-sm">
        Register Interest
      </button>
      <p className="text-xs text-gray-400 text-center mt-2">
        Based on {formatHa(assessment.totalHectares)} at 20% panel coverage
      </p>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          Data: Geoscience Australia &middot; BOM &middot; QLD Spatial &middot; Energy QLD DAPR 2025
        </p>
        <p className="text-[10px] text-gray-400 text-center">
          Estimates are indicative only and based on publicly available data. Not financial advice.
        </p>
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{label}</span>
      <span className={cn('font-mono font-medium', highlight ? 'text-brand-600 font-bold' : 'text-gray-900')}>
        {value}
      </span>
    </div>
  );
}

function RatingBadge({ rating }: { rating: GridProximityRating }) {
  const labels: Record<GridProximityRating, string> = {
    green: 'High Viability',
    amber: 'Moderate',
    red: 'Low Viability',
    grey: 'Not Viable',
  };
  const classes: Record<GridProximityRating, string> = {
    green: 'badge-green',
    amber: 'badge-amber',
    red: 'badge-red',
    grey: 'badge-grey',
  };
  return <span className={classes[rating]}>{labels[rating]}</span>;
}

// --- Utility ---

function ratingColor(rating: GridProximityRating): string {
  const colors: Record<GridProximityRating, string> = {
    green: '#22c55e',
    amber: '#f59e0b',
    red: '#ef4444',
    grey: '#9ca3af',
  };
  return colors[rating];
}

// --- Registration Modal ---

function RegistrationModal({ assessment, onClose }: { assessment: LandAssessment; onClose: () => void }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyAddress: '',
    totalHectares: assessment.totalHectares.toString(),
    currentLandUse: '',
    interestLevel: 'exploring' as 'exploring' | 'serious' | 'ready',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Extract region from address (last part before postcode) or use a default
    const addressParts = form.propertyAddress.split(',').map(s => s.trim());
    const region = addressParts.length > 1 ? addressParts[addressParts.length - 1].replace(/\d{4}$/, '').trim() : 'QLD';

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      propertyAddress: form.propertyAddress,
      coordinates: assessment.coordinates,
      totalHectares: parseFloat(form.totalHectares) || assessment.totalHectares,
      currentLandUse: form.currentLandUse,
      interestLevel: form.interestLevel,
      notes: form.notes || undefined,
      region,
      gridDistanceKm: assessment.nearestSubstation.distanceKm,
      gridRating: assessment.overallViabilityScore,
      assessmentSnapshot: assessment,
    };
    const res = await api.registerFarmer(payload as any);

    setSubmitting(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || 'Something went wrong. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] mx-4 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Registration Received</h3>
          <p className="text-sm text-gray-600 mb-6">
            Thanks, {form.firstName}. We'll be in touch about solar opportunities for your property.
            Your assessment data has been saved.
          </p>
          <button onClick={onClose} className="btn-primary px-6 text-sm">
            Back to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[480px] mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Register Your Interest</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Location: {assessment.coordinates.lat.toFixed(4)}, {assessment.coordinates.lng.toFixed(4)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Assessment summary */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-sm font-bold font-mono text-gray-900">
                {formatAud(assessment.leaseEstimate.annualIncomeAud)}
              </div>
              <div className="text-xs text-gray-500">Est. annual lease</div>
            </div>
            <div>
              <div className="text-sm font-bold font-mono text-brand-600">
                {formatKm(assessment.nearestSubstation.distanceKm)}
              </div>
              <div className="text-xs text-gray-500">To {assessment.nearestSubstation.name}</div>
            </div>
            <div>
              <RatingBadge rating={assessment.overallViabilityScore} />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">First name *</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full h-9 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                placeholder="John"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Last name *</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full h-9 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                placeholder="Smith"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Email *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full h-9 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                placeholder="farmer@email.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Phone *</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full h-9 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                placeholder="04XX XXX XXX"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Property address *</label>
            <input
              name="propertyAddress"
              value={form.propertyAddress}
              onChange={handleChange}
              required
              className="w-full h-9 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              placeholder="123 Rural Rd, Dalby QLD 4405"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Property size (ha) *</label>
              <input
                name="totalHectares"
                type="number"
                min="1"
                value={form.totalHectares}
                onChange={handleChange}
                required
                className="w-full h-9 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Current land use *</label>
              <select
                name="currentLandUse"
                value={form.currentLandUse}
                onChange={handleChange}
                required
                className="w-full h-9 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="Cattle grazing">Cattle grazing</option>
                <option value="Sheep grazing">Sheep grazing</option>
                <option value="Dryland cropping">Dryland cropping</option>
                <option value="Irrigated cropping">Irrigated cropping</option>
                <option value="Mixed farming">Mixed farming</option>
                <option value="Horticulture">Horticulture</option>
                <option value="Unused / fallow">Unused / fallow</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Interest level</label>
            <select
              name="interestLevel"
              value={form.interestLevel}
              onChange={handleChange}
              className="w-full h-9 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            >
              <option value="exploring">Just exploring options</option>
              <option value="serious">Seriously considering solar leasing</option>
              <option value="ready">Ready to discuss with developers</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Notes (optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
              placeholder="Anything else we should know about your property..."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-start gap-2">
            <input type="checkbox" name="consent" required className="mt-1 accent-brand-500 shrink-0" />
            <label className="text-xs text-gray-500 leading-relaxed">
              I consent to AgriVolt collecting and storing my information to connect me with solar developers.
              My location will be anonymized (&plusmn;2km) when shown to developers.
              I can request deletion of my data at any time.
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              'Submit Registration'
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Your exact location is kept private. Developers see only an approximate region.
          </p>
        </form>
      </div>
    </div>
  );
}

// --- Utility ---

/** Simple haversine distance in kilometers */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
