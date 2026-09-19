import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapView = ({ sites = [], onSiteSelect, selectedSiteId }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapStyle, setMapStyle] = useState('satellite');

  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  const triggerResize = useCallback(() => {
    if (map.current) {
      map.current.resize();
    }
  }, []);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = token;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [20.0, 15.0], // Global centered view
      zoom: 1.8,
      projection: 'globe',
    });

    map.current = mapInstance;

    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapInstance.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };

    mapInstance.on('load', () => {
      handleResize();
    });

    mapInstance.on('style.load', () => {
      handleResize();
      mapInstance.setFog({
        color: 'rgb(15, 23, 42)', // clean slate atmosphere
        'high-color': 'rgb(56, 189, 248)', // clean sky blue horizon
        'horizon-blend': 0.15,
        'space-color': 'rgb(11, 15, 25)',
        'star-intensity': 0.6,
      });
    });

    // ResizeObserver watches container dimensions and adjusts canvas instantly
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    window.addEventListener('resize', handleResize);

    // Initial tick resize triggers
    const t1 = setTimeout(handleResize, 100);
    const t2 = setTimeout(handleResize, 400);
    const t3 = setTimeout(handleResize, 1000);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [token, triggerResize]);

  // Update GeoJSON Layers whenever sites change
  useEffect(() => {
    if (!map.current) return;

    const setupLayers = () => {
      const geojson = {
        type: 'FeatureCollection',
        features: sites.map((s) => ({
          type: 'Feature',
          id: s.id,
          geometry: s.geometry,
          properties: {
            id: s.id,
            name: s.name,
            project_id: s.project_id,
            project_name: s.project_name || '',
            area_hectares: s.area_hectares,
            region: s.region,
            centroid_lat: s.centroid_lat,
            centroid_lng: s.centroid_lng,
          },
        })),
      };

      if (map.current.getSource('sites-source')) {
        map.current.getSource('sites-source').setData(geojson);
      } else {
        map.current.addSource('sites-source', {
          type: 'geojson',
          data: geojson,
        });

        // Fill layer
        map.current.addLayer({
          id: 'sites-fill',
          type: 'fill',
          source: 'sites-source',
          paint: {
            'fill-color': [
              'case',
              ['==', ['get', 'id'], selectedSiteId || ''],
              '#10b981', // Highlight green
              '#059669', // Default emerald
            ],
            'fill-opacity': ['case', ['==', ['get', 'id'], selectedSiteId || ''], 0.65, 0.4],
          },
        });

        // Outline layer
        map.current.addLayer({
          id: 'sites-line',
          type: 'line',
          source: 'sites-source',
          paint: {
            'line-color': '#34d399',
            'line-width': ['case', ['==', ['get', 'id'], selectedSiteId || ''], 3, 1.5],
          },
        });

        // Click handler
        map.current.on('click', 'sites-fill', (e) => {
          if (e.features && e.features[0]) {
            const feat = e.features[0];
            if (onSiteSelect) {
              onSiteSelect(feat.properties);
            }
          }
        });

        // Cursor pointer
        map.current.on('mouseenter', 'sites-fill', () => {
          map.current.getCanvas().style.cursor = 'pointer';
        });
        map.current.on('mouseleave', 'sites-fill', () => {
          map.current.getCanvas().style.cursor = '';
        });
      }
    };

    if (map.current.isStyleLoaded()) {
      setupLayers();
    } else {
      map.current.once('style.load', setupLayers);
    }
  }, [sites, selectedSiteId, onSiteSelect, mapStyle]);

  // Fly to site when selectedSiteId changes
  useEffect(() => {
    if (!map.current || !selectedSiteId) return;
    const selected = sites.find((s) => s.id === selectedSiteId);
    if (selected && selected.centroid_lng && selected.centroid_lat) {
      map.current.flyTo({
        center: [selected.centroid_lng, selected.centroid_lat],
        zoom: 11,
        speed: 1.4,
        curve: 1.2,
        essential: true,
      });
    }
  }, [selectedSiteId, sites]);

  const switchStyle = (styleType) => {
    if (!map.current) return;
    setMapStyle(styleType);
    let styleUrl = 'mapbox://styles/mapbox/satellite-streets-v12';
    if (styleType === 'outdoors') styleUrl = 'mapbox://styles/mapbox/outdoors-v12';
    if (styleType === 'dark') styleUrl = 'mapbox://styles/mapbox/dark-v11';
    map.current.setStyle(styleUrl);
    setTimeout(() => {
      if (map.current) map.current.resize();
    }, 150);
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden shadow-2xl">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Map Style Switcher & Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <div className="bg-forest-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg flex items-center space-x-2 text-xs font-semibold text-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>PostGIS Biome View</span>
        </div>

        <div className="bg-forest-900/90 backdrop-blur-md p-1 rounded-xl shadow-lg flex items-center space-x-1 text-xs">
          <button
            onClick={() => switchStyle('satellite')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              mapStyle === 'satellite'
                ? 'bg-emerald-500 text-forest-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => switchStyle('outdoors')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              mapStyle === 'outdoors'
                ? 'bg-emerald-500 text-forest-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Terrain
          </button>
          <button
            onClick={() => switchStyle('dark')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              mapStyle === 'dark'
                ? 'bg-emerald-500 text-forest-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapView;
