// src/Layout/MainLayout.tsx
import { useEffect, useState } from "react";
import { getStoreValue, setStoreValue } from "pulsy";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Slidebar";
import Navbar from "./Navbar";
import Profile from "../components/profile";
import type { AuthStore } from "../Types/AuthStore";

const MainLayout: React.FC = () => {
  const authStore = getStoreValue<AuthStore>("auth");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    setStoreValue<AuthStore>("auth", { user: null, token: null });
    navigate("/login");
  };

  if (!authStore?.user) return <Navigate to="/login" replace />;

  const sidebarWidth = collapsed && !isMobile ? "w-16" : "w-64";
  const contentMarginLeft =
    isMobile || sidebarOpen ? "ml-0" : collapsed ? "ml-16" : "ml-64";

  return (
    <div className="w-screen overflow-hidden font-sans bg-gray-100 text-gray-900 relative">
      {/* Sidebar */}
      {(!isMobile || sidebarOpen) && (
        <aside
          className={`fixed top-0 left-0 h-screen z-50 shadow-md transition-all duration-300 ${
            isMobile ? "w-[64px]" : sidebarWidth
          } ${isMobile ? "bg-[#14213D]" : ""}`}
        >
          <Sidebar
            collapsed={isMobile ? true : collapsed}
            setCollapsed={setCollapsed}
          />
        </aside>
      )}

      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Navbar */}
      <header
        className={`fixed top-0 right-0 h-20 z-40 w-full transition-all duration-300 ${
          isMobile ? "" : contentMarginLeft
        }`}
      >
        <Navbar
          user={authStore.user}
          onProfileClick={() => setIsProfileOpen(true)}
          onMenuClick={() => {
            if (isMobile) setSidebarOpen((prev) => !prev);
          }}
        />
      </header>

      {/* Profile Dropdown */}
      {isProfileOpen && (
        <div
          className="fixed z-50"
          style={{
            top: "5rem",
            right: collapsed ? "1rem" : "1.5rem",
          }}
        >
          <Profile
            user={authStore.user}
            onClose={() => setIsProfileOpen(false)}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-20 min-h-screen pb-10 overflow-y-auto p-4 ${
          isMobile ? "ml-0" : contentMarginLeft
        }`}
      >
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
