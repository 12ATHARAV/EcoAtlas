import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const DrawPolygonMap = ({ onPolygonCreated }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);

  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-60.45, -2.9], // Default center around Amazonas
      zoom: 6,
    });

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'draw_polygon',
    });

    map.current.addControl(draw.current, 'top-left');
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const handleCreateOrUpdate = (e) => {
      const data = draw.current.getAll();
      if (data.features.length > 0) {
        const latestFeature = data.features[data.features.length - 1];
        if (onPolygonCreated) {
          onPolygonCreated(latestFeature.geometry);
        }
      }
    };

    map.current.on('draw.create', handleCreateOrUpdate);
    map.current.on('draw.update', handleCreateOrUpdate);

    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };

    map.current.on('load', handleResize);

    const resizeObserver = new ResizeObserver(handleResize);
    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    const t1 = setTimeout(handleResize, 100);
    const t2 = setTimeout(handleResize, 400);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [token, onPolygonCreated]);

  return (
    <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-inner">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      <div className="absolute bottom-3 left-3 bg-forest-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-slate-300 font-medium z-10">
        📍 Click on the map to draw vertices of your site polygon
      </div>
    </div>
  );
};

export default DrawPolygonMap;
