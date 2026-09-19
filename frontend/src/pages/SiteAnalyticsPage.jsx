import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  TreePine,
  Eye,
  ShieldCheck,
  Thermometer,
  CloudRain,
  Calendar,
  MapPin,
} from 'lucide-react';
import {
  CarbonStockChart,
  NDVIChart,
  BiodiversityChart,
} from '../components/charts/AnalyticsCharts';
import MapView from '../components/map/MapView';
import api from '../api/client';

const SiteAnalyticsPage = () => {
  const { id } = useParams();
  const [site, setSite] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        const [siteRes, analyticsRes] = await Promise.all([
          api.get(`/sites/${id}`),
          api.get(`/sites/${id}/analytics`),
        ]);
        setSite(siteRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSiteData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh] text-slate-400">
        Loading geospatial telemetry...
      </div>
    );
  }

  if (!site) {
    return <div className="p-8 text-center text-slate-400">Site not found.</div>;
  }

  const latest = analytics.length > 0 ? analytics[analytics.length - 1] : {};

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Bar */}
      <div>
        <NavLink
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-eco-400 mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </NavLink>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              {site.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-eco-400" />
              {site.region || 'Active Biome'} • {site.area_hectares} Hectares • Registered{' '}
              {new Date(site.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-eco-500/10 border border-eco-500/30 text-eco-400 text-xs font-semibold rounded-xl">
              PostGIS Polygon Verified
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-forest-850/80 shadow-md backdrop-blur-sm">
          <div className="text-xs text-slate-400 uppercase font-medium">Current Carbon Stock</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {latest.carbon_stock_tonnes?.toLocaleString() || '...'}{' '}
            <span className="text-xs text-slate-400 font-normal font-sans">tCO2e</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-forest-850/80 shadow-md backdrop-blur-sm">
          <div className="text-xs text-slate-400 uppercase font-medium">Sentinel-2 NDVI</div>
          <div className="text-2xl font-bold text-gold-400 mt-1 font-mono">
            {latest.ndvi || '...'}{' '}
            <span className="text-xs text-slate-400 font-normal font-sans">index</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-forest-850/80 shadow-md backdrop-blur-sm">
          <div className="text-xs text-slate-400 uppercase font-medium">Biodiversity Health</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1 font-mono">
            {latest.biodiversity_index || '...'}{' '}
            <span className="text-xs text-slate-400 font-normal font-sans">/ 10</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-forest-850/80 shadow-md backdrop-blur-sm">
          <div className="text-xs text-slate-400 uppercase font-medium">Tree Cover Ratio</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {latest.tree_cover_pct || '...'}%
          </div>
        </div>
      </div>

      {/* Embedded Map & Telemetry Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 bg-forest-850/80 rounded-2xl p-6 flex flex-col shadow-2xl backdrop-blur-sm">
          <h2 className="text-base font-bold text-white mb-4">Geographic Boundary & Centroid</h2>
          <div className="flex-1 h-72 rounded-xl overflow-hidden">
            <MapView sites={[site]} selectedSiteId={site.id} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-2 text-xs text-slate-400">
            <div>
              Centroid Lat: <span className="text-white font-mono">{site.centroid_lat}</span>
            </div>
            <div>
              Centroid Lng: <span className="text-white font-mono">{site.centroid_lng}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-forest-850/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          <h2 className="text-base font-bold text-white mb-4">Biodiversity Score Progression</h2>
          <BiodiversityChart analytics={analytics} />
        </div>
      </div>

      {/* Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-forest-850/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          <h2 className="text-base font-bold text-white mb-4">
            Historical Biomass Carbon Stock (tCO2e)
          </h2>
          <CarbonStockChart analytics={analytics} />
        </div>
        <div className="bg-forest-850/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          <h2 className="text-base font-bold text-white mb-4">NDVI Canopy Density Trend</h2>
          <NDVIChart analytics={analytics} />
        </div>
      </div>
    </div>
  );
};

export default SiteAnalyticsPage;
