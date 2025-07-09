// src/components/Sidebar.tsx
import React from 'react';
import '../Css/Slidebar.css'; // Ensure the file exists and path is correct
import { NavLink } from 'react-router-dom';
import { getStoreValue } from 'pulsy'; // Import to access auth store
import { getAllowedRoutes } from '../utils/getAllowedRoutes'; // Import getAllowedRoutes
import type { AuthStore } from '../Types/AuthStore'; // Import AuthStore type
import {
  LayoutDashboard,
  Plus,
  List,
  Calendar,
  User,
  // LogOut,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  // Get user role from auth store
  const authStore = getStoreValue<AuthStore>('auth');
  const userRole = authStore?.user?.role; // Safely access role
  const allowedRoutes = getAllowedRoutes(userRole); // Get allowed routes based on role

  // Define navigation items with their paths, labels, and icons
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/user', label: 'Users', icon: <User size={20} /> },
    { path: '/add-expense', label: 'Add Expense', icon: <Plus size={20} /> },
    { path: '/expenses', label: 'View Expenses', icon: <List size={20} /> },
    { path: '/monthly-summary', label: 'Monthly Summary', icon: <Calendar size={20} /> },
    // { path: '/login', label: 'Log Out', icon: <LogOut size={20} /> }, // Log Out is special
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">Expense App</div>
      <nav className="sidebar-nav">
        {navItems
          .filter((item) =>
            item.path === '/login' ? true : allowedRoutes.includes(item.path)
          ) // Always show Log Out, filter others based on allowedRoutes
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
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