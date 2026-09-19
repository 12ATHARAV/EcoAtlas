import React, { useState, useEffect } from 'react';
import { Layers, TreePine, Award, TrendingUp, ArrowUpRight, Plus, MapPin } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import MapView from '../components/map/MapView';
import { CarbonStockChart, NDVIChart } from '../components/charts/AnalyticsCharts';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import api from '../api/client';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [siteAnalytics, setSiteAnalytics] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, geoRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/sites/geojson'),
        ]);
        setSummary(sumRes.data);
        const features = geoRes.data.features || [];
        const siteList = features.map((f) => ({
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

        if (siteList.length > 0) {
          handleSelectSite(siteList[0]);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectSite = async (site) => {
    setSelectedSite(site);
    try {
      const resp = await api.get(`/sites/${site.id}/analytics`);
      setSiteAnalytics(resp.data);
    } catch (err) {
      console.error('Failed to load site analytics', err);
    }
  };

  const statCards = [
    {
      title: 'Active Projects',
      value: summary ? summary.total_projects : '...',
      change: '+2 this month',
      icon: Layers,
      color: 'from-emerald-500/15 to-emerald-700/10',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Hectares Monitored',
      value: summary ? `${summary.total_area_hectares.toLocaleString()} ha` : '...',
      change: 'Covering 4 Global Biomes',
      icon: MapPin,
      color: 'from-emerald-600/15 to-teal-800/10',
      textColor: 'text-emerald-300',
    },
    {
      title: 'Carbon Sequestered',
      value: summary ? `${summary.total_carbon_stock_tonnes.toLocaleString()} tCO2e` : '...',
      change: 'Verified PostGIS Biomass',
      icon: TreePine,
      color: 'from-emerald-400/15 to-emerald-600/10',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Mean Biodiversity Score',
      value: summary ? `${summary.average_biodiversity_index} / 10` : '...',
      change: '+0.4 YoY Recovery',
      icon: Award,
      color: 'from-gold-500/15 to-amber-600/10',
      textColor: 'text-gold-400',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Geospatial Carbon & Biodiversity Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry, polygon boundary zoning, and Sentinel-2 vegetation health index.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-forest-850/80 shadow-xl flex flex-col justify-between hover:bg-forest-850 transition-all group backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div
                  className={`p-2.5 rounded-xl bg-gradient-to-tr ${card.color} ${card.textColor}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                  {card.value}
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                  <span className="text-emerald-400 font-medium">{card.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Map & Site Detail Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Mapbox Globe View */}
        <div className="lg:col-span-7 bg-forest-850/80 rounded-2xl p-4 flex flex-col shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between px-2 py-2 mb-2">
            <div className="flex items-center space-x-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400"></div>
              <h2 className="text-base font-bold text-white">Interactive PostGIS Biome Map</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {sites.length} Active Polygon Zones
            </span>
          </div>
          <div className="flex-1 min-h-[460px] w-full relative">
            <MapView
              sites={sites}
              selectedSiteId={selectedSite?.id}
              onSiteSelect={(props) => {
                const s = sites.find((x) => x.id === props.id);
                if (s) handleSelectSite(s);
              }}
            />
          </div>
        </div>

        {/* Right: Selected Site Telemetry */}
        <div className="lg:col-span-5 bg-forest-850/80 rounded-2xl p-6 flex flex-col justify-between shadow-2xl backdrop-blur-sm">
          {selectedSite ? (
            <div className="space-y-6">
              <div className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 text-xs font-semibold rounded-lg">
                    {selectedSite.project_name || 'Conservation Zone'}
                  </span>
                  <NavLink
                    to={`/sites/${selectedSite.id}`}
                    className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    <span>Full Analytics</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </NavLink>
                </div>
                <h3 className="text-xl font-bold text-white mt-2">{selectedSite.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  {selectedSite.region} • {selectedSite.area_hectares} Hectares
                </p>
              </div>

              {/* Carbon Telemetry Trend */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    24-Month Biomass Carbon Accumulation
                  </span>
                  <span className="text-xs text-emerald-400 font-bold font-mono">
                    {siteAnalytics.length > 0
                      ? `${siteAnalytics[siteAnalytics.length - 1].carbon_stock_tonnes} tCO2e`
                      : ''}
                  </span>
                </div>
                <CarbonStockChart analytics={siteAnalytics} />
              </div>

              {/* NDVI Trend */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Sentinel-2 NDVI Vegetation Density
                  </span>
                  <span className="text-xs text-gold-400 font-bold font-mono">
                    {siteAnalytics.length > 0
                      ? `${siteAnalytics[siteAnalytics.length - 1].ndvi} Index`
                      : ''}
                  </span>
                </div>
                <NDVIChart analytics={siteAnalytics} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
              <MapPin className="h-10 w-10 stroke-1 mb-2 text-forest-600" />
              <p className="text-sm font-medium">
                Select any polygon on the map to inspect telemetry
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={() => {
          fetchData();
        }}
      />
    </div>
  );
};

export default DashboardPage;
