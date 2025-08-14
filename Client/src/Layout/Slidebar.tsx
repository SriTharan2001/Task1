import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getStoreValue } from "pulsy";
import { getAllowedRoutes } from "../utils/getAllowedRoutes";
import type { AuthStore } from "../Types/AuthStore";
import {
  LayoutDashboard,
  Plus,
  List,
  Calendar,
  User,
} from "lucide-react";
import { LuListCollapse } from "react-icons/lu";
import "../index.css";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const authStore = getStoreValue<AuthStore>("auth");
  const userRole = authStore?.user?.role;
  const allowedRoutes = getAllowedRoutes(userRole);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={30} /> },
    { path: "/user", label: "Users", icon: <User size={30} /> },
    { path: "/add-expense", label: "Add Expense", icon: <Plus size={30} /> },
    { path: "/expenses", label: "View Expenses", icon: <List size={30} /> },
    { path: "/monthly-summary", label: "Monthly Summary", icon: <Calendar size={30} /> },
  ];

  const sidebarWidth = collapsed || isMobile ? "w-[64px]" : "w-64";

  return (
    <aside
      style={{ backgroundColor: "#14213D" }}
      className={`transition-all duration-300 fixed top-0 left-0 z-50 h-screen border-r border-indigo-200 ${sidebarWidth} ${
        isMobile ? "absolute" : "relative"
      }`}
    >
      {/* Collapse Toggle */}
      <div
        className="p-4 flex items-center gap-2 text-white text-xl font-bold cursor-pointer pt-6"
        onClick={() => {
          if (!isMobile) setCollapsed((prev) => !prev);
        }}
      >
        <LuListCollapse size={30} />
        {!collapsed && !isMobile && "Expense App"}
      </div>

      {/* Navigation Links */}
      <nav className="p-2 flex flex-col gap-4 mt-4">
        {navItems
          .filter((item) =>
            item.path === "/login" ? true : allowedRoutes.includes(item.path)
          )
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed || isMobile ? item.label : ""}
              className={({ isActive }) =>
                `flex items-center ${
                  collapsed || isMobile ? "justify-center" : "gap-2"
                } px-2 py-2 rounded-lg transition-colors font-medium ${
                  isActive ? "bg-yellow-500 text-black" : "text-white"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {}
                  : {
                      backgroundColor: "transparent",
                      color: "#ffffff",
                    }
              }
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                if (!target.classList.contains("bg-yellow-500")) {
                  target.style.backgroundColor = "#E89F2BFF";
                  target.style.color = "#000000";
                }
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                if (!target.classList.contains("bg-yellow-500")) {
                  target.style.backgroundColor = "transparent";
                  target.style.color = "#ffffff";
                }
              }}
            >
              {item.icon}
              {!collapsed && !isMobile && item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
