import React, { useState, useEffect } from 'react';
import MapView from '../components/map/MapView';
import api from '../api/client';
import { NavLink } from 'react-router-dom';
import { Layers, ArrowUpRight, MapPin } from 'lucide-react';

const MapExplorerPage = () => {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const resp = await api.get('/sites/geojson');
        const siteList = (resp.data.features || []).map((f) => ({
          id: f.id,
          name: f.properties.name,
          project_name: f.properties.project_name,
          project_id: f.properties.project_id,
          geometry: f.geometry,
          area_hectares: f.properties.area_hectares,
          region: f.properties.region,
          centroid_lat: f.properties.centroid_lat,
          centroid_lng: f.properties.centroid_lng,
        }));
        setSites(siteList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-10px)] overflow-hidden">
      <MapView
        sites={sites}
        selectedSiteId={selectedSite?.id}
        onSiteSelect={(props) => {
          const s = sites.find((x) => x.id === props.id);
          if (s) setSelectedSite(s);
        }}
      />

      {/* Floating Control Panel */}
      <div className="absolute top-6 right-6 z-20 w-80 bg-forest-900/95 backdrop-blur-md border border-forest-700/80 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center space-x-2 text-white font-bold text-sm">
          <Layers className="h-4 w-4 text-emerald-400" />
          <span>Active Forest & Wetland Reserves</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {sites.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSite(s)}
              className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                selectedSite?.id === s.id
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm'
                  : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <div className="truncate">
                <div className="font-semibold truncate">{s.name}</div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  {s.region} • {s.area_hectares} ha
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedSite && (
          <div className="pt-2 flex justify-between items-center">
            <span className="text-xs text-emerald-400 font-semibold">Site Selected</span>
            <NavLink
              to={`/sites/${selectedSite.id}`}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              <span>View Analytics</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapExplorerPage;
