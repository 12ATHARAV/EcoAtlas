import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import SiteAnalyticsPage from './pages/SiteAnalyticsPage';
import MapExplorerPage from './pages/MapExplorerPage';
import LoginPage from './pages/LoginPage';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/map"
            element={
              <DashboardLayout>
                <MapExplorerPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/projects"
            element={
              <DashboardLayout>
                <ProjectsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/sites/:id"
            element={
              <DashboardLayout>
                <SiteAnalyticsPage />
              </DashboardLayout>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
