import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  FolderKanban,
  ShieldCheck,
  LogOut,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Geospatial Map', path: '/map', icon: Map },
    { name: 'Projects & Sites', path: '/projects', icon: FolderKanban },
  ];

  return (
    <aside className="w-64 bg-forest-900 border-r border-slate-800/40 flex flex-col justify-between shrink-0 min-h-screen text-slate-300">
      <div>
        {/* Brand Header */}
        <div className="p-6 flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-forest-950 font-bold">
            <Globe className="h-6 w-6 text-forest-950" />
          </div>
          <div>
            <div className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
              Eco<span className="text-emerald-400">Atlas</span>
            </div>
            <div className="text-[11px] text-emerald-400/80 font-medium tracking-wide">
              Carbon Intelligence
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="px-4 py-2 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 font-semibold shadow-sm'
                      : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Pro Banner */}
        <div className="mx-4 mt-6 p-4 rounded-xl bg-slate-800/40 shadow-inner">
          <div className="flex items-center space-x-2 text-gold-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Satellite Feed</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Continuous NDVI & biomass change detection synced via Sentinel-2 & PostGIS.
          </p>
        </div>
      </div>

      {/* User Info & Logout */}
      <div className="p-4">
        {user ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">
                  {user.full_name || 'Admin'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-1.5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-forest-950 font-semibold text-sm transition-colors"
          >
            Sign In
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
