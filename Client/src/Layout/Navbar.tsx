import React from 'react';
import { useNavigate } from 'react-router-dom';

// Assuming you have a User type. If not, you can remove the typing or adjust as needed
interface User {
  name: string;
  // Add other user properties as needed
}

interface NavbarProps {
  user?: User | null; // User prop to check if logged in
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const navigate = useNavigate(); // Hook for navigation

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile'); // Navigate to profile if logged in
    } else {
      navigate('/login'); // Navigate to login if not logged in
    }
  };

  return (
    <nav
      style={{
        background: 'linear-gradient(to right, #1e3a8a, #3730a3, #5b21b6)',
        height: '80px',
        color: '#ffffff',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow:
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
          }}
        >
          Expense Data
        </h2>
      </div>

      {/* User Profile Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginRight: '24px',
        }}
      >
        {user ? (
          <>
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              Welcome, {user.name}
            </span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                color: '#1e3a8a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
              title={user.name}
              onClick={handleProfileClick} // Add click handler
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          </>
        ) : (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              color: '#1e3a8a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
            title="Login"
            onClick={handleProfileClick} // Add click handler
          >
            S
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;