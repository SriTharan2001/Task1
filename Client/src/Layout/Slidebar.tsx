// src/Layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { getStoreValue } from 'pulsy';
import { getAllowedRoutes } from '../utils/getAllowedRoutes';
import type { AuthStore } from '../Types/AuthStore';
import { LayoutDashboard, Plus, List, Calendar, User } from 'lucide-react';

const Sidebar: React.FC = () => {
  const authStore = getStoreValue<AuthStore>('auth');
  const userRole = authStore?.user?.role;
  const allowedRoutes = getAllowedRoutes(userRole);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/user', label: 'Users', icon: <User size={20} /> },
    { path: '/add-expense', label: 'Add Expense', icon: <Plus size={20} /> },
    { path: '/expenses', label: 'View Expenses', icon: <List size={20} /> },
    { path: '/monthly-summary', label: 'Monthly Summary', icon: <Calendar size={20} /> },
  ];

  return (
    <aside className="w-64 bg-blue-950 border-r border-indigo-200 min-h-screen ">
      <div className="p-4 text-white text-xl font-bold">Expense App</div>
      <nav className="p-4 flex flex-col gap-2 ">
        {navItems
          .filter((item) =>
            item.path === '/login' ? true : allowedRoutes.includes(item.path)
          )
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${
                  isActive ? 'bg-blue-900 font-semibold' : 'hover:bg-blue-500 hover:text-black'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;