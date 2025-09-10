import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Sun, Moon } from "lucide-react"; // Import icons
import NotificationDropdown from "../components/Notification";
import { ThemeContext } from "../context/ThemeContext";

interface User {
  _id: string;
  userName?: string;
  role?: string;
  email?: string;
}

interface NavbarProps {
  user?: User | null;
  onProfileClick?: () => void;
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onProfileClick, onMenuClick }) => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const bellRef = useRef<HTMLDivElement>(null);

  const handleProfileClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      onProfileClick?.();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  const toggleDropdown = () => {
    setOpenDropdown((prev) => {
      const newState = !prev;
      if (newState) {
        setNotificationsCount(0);
      }
      return newState;
    });
  };

  return (
   <nav
  className={`h-20 text-white px-4 md:px-6 flex justify-between items-center shadow-lg 
    ${theme === "dark" ? "bg-blue-600" : "bg-[#14213D]"}`}
>

      {/* Mobile Hamburger */}
      <div className="md:hidden">
        <button aria-label="Menu" onClick={onMenuClick} className="focus:outline-none">
          <Menu size={28} />
        </button>
      </div>

      {/* App Title */}
      <div className="flex-1 flex justify-center md:justify-center">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
          Expense Data
        </h2>
      </div>

      {/* Right side buttons */}
      <div className="flex items-center gap-4 mr-2 md:mr-6">
        {user && (
          <div className="relative mt-3 pr-2" ref={bellRef}>
            <button
              onClick={toggleDropdown}
              className="relative focus:outline-none"
              aria-label="Notifications"
            >
              <Bell size={30} />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {notificationsCount}
                </span>
              )}
            </button>

            {openDropdown && user._id && (
              <div className="absolute right-0 mt-2 z-50">
                <NotificationDropdown
                  userId={user._id}
                  onCountChange={setNotificationsCount}
                />
              </div>
            )}
          </div>
        )}

        {/* Dark/Light toggle button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-yellow-400 transition"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
        </button>

        {/* Profile / Login */}
        {user ? (
          <div
            className="w-10 h-10 rounded-full bg-white text-indigo-900 flex items-center justify-center font-semibold text-base cursor-pointer hover:bg-gray-100 transition"
            title={user.userName || "User"}
            onClick={handleProfileClick}
          >
            {(user.userName?.charAt(0) || "U").toUpperCase()}
          </div>
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
