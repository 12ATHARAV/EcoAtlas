import React, { useState } from 'react';
import { Plus, X, MapPin } from 'lucide-react';
import DrawPolygonMap from '../map/DrawPolygonMap';
import api from '../../api/client';

const AddSiteModal = ({ isOpen, onClose, projectId, onSiteAdded }) => {
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [polygonGeometry, setPolygonGeometry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!polygonGeometry) {
      setError('Please draw a site polygon on the interactive map above.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const resp = await api.post(`/sites/project/${projectId}`, {
        name,
        region,
        geometry: polygonGeometry,
      });
      onSiteAdded(resp.data);
      onClose();
      setName('');
      setRegion('');
      setPolygonGeometry(null);
    } catch (err) {
      console.error('Failed to add site:', err);
      const detail = err.response?.data?.detail;
      let errorMsg = 'Failed to add site polygon.';
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMsg = detail.map((d) => d.msg || d.message).join(', ');
      } else if (err.message) {
        errorMsg = `${err.message}. Please verify backend connection.`;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/80 backdrop-blur-md">
      <div className="bg-forest-900 border border-slate-800/60 w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-400" />
          Add Geographical Site with Polygon
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Draw the boundary coordinates on the map. PostGIS metrics & 12 months baseline analytics
          are auto-synthesized.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Mapbox Draw Control */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Draw Polygon Boundary (Mapbox Draw)
          </label>
          <DrawPolygonMap onPolygonCreated={(geom) => setPolygonGeometry(geom)} />
          {polygonGeometry && (
            <div className="mt-2 text-xs text-emerald-400 font-medium flex items-center gap-1.5 font-mono">
              ✓ Polygon geometry captured ({polygonGeometry.coordinates[0]?.length || 0} vertices)
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Site Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Sector 4 Canopy Ridge"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Region / State
              </label>
              <input
                type="text"
                placeholder="e.g., Amazonas, Brazil"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-forest-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{loading ? 'Processing...' : 'Save Site Polygon'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSiteModal;
