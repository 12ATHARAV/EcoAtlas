import React, { useState, useEffect } from 'react';
import { Plus, FolderKanban, MapPin, TreePine, ChevronRight, Trash2 } from 'lucide-react';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import AddSiteModal from '../components/projects/AddSiteModal';
import api from '../api/client';
import { NavLink } from 'react-router-dom';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [activeProjectIdForSite, setActiveProjectIdForSite] = useState(null);

  const fetchProjects = async () => {
    try {
      const resp = await api.get('/projects');
      setProjects(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (id, e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this project and its registered sites?')) {
      try {
        await api.delete(`/projects/${id}`);
        setProjects(projects.filter((p) => p.id !== id));
      } catch (err) {
        alert('Failed to delete project. Make sure you are authenticated.');
      }
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Conservation Projects Portfolio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage carbon initiatives, register geo-fenced forest zones, and track aggregate
            sequestration.
          </p>
        </div>
        <button
          onClick={() => setIsProjectModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-forest-850/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all backdrop-blur-sm group hover:bg-forest-850"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 text-xs font-semibold rounded-lg uppercase tracking-wider">
                    {proj.project_type}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-3 group-hover:text-emerald-300 transition-colors">
                    {proj.name}
                  </h3>
                </div>
                <button
                  onClick={(e) => handleDeleteProject(proj.id, e)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {proj.description || 'No description provided.'}
              </p>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 my-5 p-3.5 rounded-xl bg-slate-900/60 text-center">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Sites</div>
                  <div className="text-base font-bold text-white font-mono">
                    {proj.sites.length}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Monitored Area</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">
                    {proj.total_area_hectares} ha
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Carbon Stock</div>
                  <div className="text-base font-bold text-gold-400 font-mono">
                    {proj.total_carbon_stock} t
                  </div>
                </div>
              </div>

              {/* Nested Sites List */}
              <div className="space-y-2 mt-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Geographical Sites ({proj.sites.length})</span>
                </div>
                {proj.sites.length === 0 ? (
                  <div className="text-xs text-slate-500 italic py-2">
                    No sites added yet. Draw one on the map to start telemetry.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {proj.sites.map((s) => (
                      <NavLink
                        key={s.id}
                        to={`/sites/${s.id}`}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-800/80 text-xs text-slate-200 transition-colors group/row"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="font-medium truncate group-hover/row:text-emerald-300 transition-colors">
                            {s.name}
                          </span>
                          <span className="text-slate-500 text-[11px] font-mono">
                            ({s.area_hectares} ha)
                          </span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover/row:text-white transition-colors shrink-0" />
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between mt-4">
              <button
                onClick={() => setActiveProjectIdForSite(proj.id)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold transition-colors flex items-center space-x-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Site Polygon</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={fetchProjects}
      />

      <AddSiteModal
        isOpen={!!activeProjectIdForSite}
        projectId={activeProjectIdForSite}
        onClose={() => setActiveProjectIdForSite(null)}
        onSiteAdded={fetchProjects}
      />
    </div>
  );
};

export default ProjectsPage;
