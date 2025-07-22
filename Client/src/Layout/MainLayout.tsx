// src/Layout/MainLayout.tsx

import { useState } from 'react';
import { getStoreValue, setStoreValue } from 'pulsy';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Slidebar';
import Navbar from './Navbar';
import Profile from '../components/profile';
import type { AuthStore } from '../Types/AuthStore';

const MainLayout: React.FC = () => {
  const authStore = getStoreValue<AuthStore>('auth');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Reset both user and token
    setStoreValue<AuthStore>('auth', {
      user: null,
      token: null,
    });

    console.log('Logged out');

    // Redirect to login page
    navigate('/login');
  };

  if (!authStore?.user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 relative">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Navbar
          user={authStore.user}
          onProfileClick={() => setIsProfileOpen(true)}
        />

        {isProfileOpen && (
          <div className="absolute top-[90px] right-6 z-50">
            <Profile
              user={authStore.user}
              onClose={() => setIsProfileOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        )}

        <main className="flex-1 p-6 md:p-8 bg-white rounded-xl shadow-lg m-4 md:m-6 transition-all hover:shadow-xl">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
