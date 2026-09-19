import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-forest-950 text-text-primary font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen bg-forest-950">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
