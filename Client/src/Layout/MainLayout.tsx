// src/Layout/MainLayout.tsx (example)
import { getStoreValue } from 'pulsy';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Slidebar.tsx';
import type { AuthStore } from '../Types/AuthStore';
import Navbar from './Navbar.tsx';

const MainLayout: React.FC = () => {
  const authStore = getStoreValue<AuthStore>('auth');
  if (!authStore?.user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="main-layout">
      <Sidebar />
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;