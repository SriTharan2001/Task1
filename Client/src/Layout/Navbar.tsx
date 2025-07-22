// src/Layout/Navbar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  userName?: string;
  role?: string;
  email?: string;
}

interface NavbarProps {
  user?: User | null;
  onProfileClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onProfileClick }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      onProfileClick?.(); // trigger open from MainLayout
    }
  };

  return (
    <nav className="bg-blue-950 h-20 text-white px-6 flex justify-between items-center shadow-lg">
      <div className="flex-1 flex justify-center">
        <h2 className="text-2xl font-extrabold tracking-tight">Expense Data</h2>
      </div>
      <div className="flex items-center gap-4 mr-6">
        {user ? (
          <>
            <span className="text-base font-medium">Welcome, {user.userName || 'User'}</span>
            <div
              className="w-10 h-10 rounded-full bg-white text-indigo-900 flex items-center justify-center font-semibold text-base cursor-pointer hover:bg-gray-100 transition"
              title={user.userName || 'User'}
              onClick={handleProfileClick}
            >
              {(user.userName?.charAt(0) || 'U').toUpperCase()}
            </div>
          </>
        ) : (
          <div
            className="w-10 h-10 rounded-full bg-white text-indigo-900 flex items-center justify-center font-semibold text-base cursor-pointer hover:bg-gray-100 transition"
            title="Login"
            onClick={handleProfileClick}
          >
            <span className="text-base font-medium">Login</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
