// src/Layout/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Slidebar';
import  '../Css/MainLayout.css'; // ✅ Fix filename if needed

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <Navbar />
      <div className="layout-body">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
