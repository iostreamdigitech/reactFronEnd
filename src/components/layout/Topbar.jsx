import DarkModeToggle from './DarkModeToggle';
import { Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react';
export default function Topbar({ onMenu, darkMode, setDarkMode, onLogout }) {
  return (
    <div className="bg-white dark:bg-gray-900 shadow px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="md:hidden text-gray-700 dark:text-gray-200">
          <Menu size={20} />
        </button>
        <h1 className="font-bold text-xl text-gray-800 dark:text-gray-100">Admin Panel</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Logout Button */}
        <button
           onClick={onLogout}
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>

        {/* Dark Mode Toggle */}
        <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>
    </div>
  );
}
