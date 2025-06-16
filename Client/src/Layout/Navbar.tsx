import React from 'react';


const Navbar: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 h-[80px] text-white p-4 flex justify-between items-center shadow-xl">
      <div className="flex-1 flex justify-center">
        <h2 className="text-2xl font-extrabold tracking-wider">Expense Data</h2>
      </div>
    </nav>
  );
};

export default Navbar;
