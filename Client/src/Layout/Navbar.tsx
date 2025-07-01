import React from 'react';

const Navbar: React.FC = () => {
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
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
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
    </nav>
  );
};

export default Navbar;