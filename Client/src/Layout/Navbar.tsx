// src/Layout/Navbar.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

interface User {
  userName?: string;
  role?: string;
  email?: string;
}

interface NavbarProps {
  user?: User | null;
  onProfileClick?: () => void;
  onMenuClick?: () => void; // <-- added for mobile toggle
}

const Navbar: React.FC<NavbarProps> = ({ user, onProfileClick, onMenuClick }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      onProfileClick?.();
    }
  };

  return (
    <nav
      style={{ backgroundColor: "#14213D" }}
      className="h-20 text-white px-4 md:px-6 flex justify-between items-center shadow-lg"
    >
      {/* Mobile Hamburger */}
      <div className="md:hidden">
        <button
          aria-label="Menu"

          onClick={onMenuClick}
          className="focus:outline-none"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* App Title */}
      <div className="flex-1 flex justify-center md:justify-center">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Expense Data</h2>
      </div>

      {/* Profile / Login */}
      <div className="flex items-center gap-4 mr-2 md:mr-6">
        {user ? (
          <>
            <span className="text-sm md:text-base font-medium hidden sm:inline">
              Welcome, {user.userName || "User"}
            </span>
            <div
              className="w-10 h-10 rounded-full bg-white text-indigo-900 flex items-center justify-center font-semibold text-base cursor-pointer hover:bg-gray-100 transition"
              title={user.userName || "User"}
              onClick={handleProfileClick}
            >
              {(user.userName?.charAt(0) || "U").toUpperCase()}
            </div>
          </>
        ) : (
          <div
            className="w-10 h-10 rounded-full bg-white text-indigo-900 flex items-center justify-center font-semibold text-base cursor-pointer hover:bg-gray-100 transition"
            title="Login"
            onClick={handleProfileClick}
          >
            <span className="text-sm md:text-base">Login</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
