import React from 'react';
import "../Css/Slidebar.css"; // Ensure the file exists and path is correct
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Plus,
  List,
  Calendar,
  User,
  LogOut, // Added LogOut icon
} from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        Expense App
      </div>
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'nav-link-active' : ''}`
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink
          to="/user"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'nav-link-active' : ''}`
          }
        >
          <User size={20} />
          Users
        </NavLink>
        <NavLink
          to="/add-expense"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'nav-link-active' : ''}`
          }
        >
          <Plus size={20} />
          Add Expense
        </NavLink>
        <NavLink
          to="/expenses"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'nav-link-active' : ''}`
          }
        >
          <List size={20} />
          View Expenses
        </NavLink>
        <NavLink
          to="/monthly-summary"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'nav-link-active' : ''}`
          }
        >
          <Calendar size={20} />
          Monthly Summary
        </NavLink>
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'nav-link-active' : ''}`
          }
        >
          <LogOut size={20} /> {/* Added LogOut icon */}
          Log Out
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;