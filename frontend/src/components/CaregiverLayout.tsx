import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LanguageSelector } from './LanguageSelector';
import { SettingsModal } from './SettingsModal';
import { OfflineIndicator } from './OfflineIndicator';
import { Settings, LogOut } from 'lucide-react';

export const CaregiverLayout = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/caregiver', icon: '📊', label: 'Dashboard' },
    { path: '/caregiver/patients', icon: '👥', label: 'Patients' },
    { path: '/caregiver/passport-edit', icon: '📖', label: 'Memory Passport' },
    { path: '/caregiver/history', icon: '📜', label: 'Patient History' },
    { path: '/caregiver/alerts', icon: '⚠️', label: 'Alerts' },
  ];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col md:flex-row w-full max-w-[100vw] overflow-x-hidden">
      <OfflineIndicator />
      
      {/* Desktop Sidebar - Clean White */}
      <aside className="w-64 bg-white border-r-2 border-gray-200 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b-2 border-gray-200 flex items-center justify-between">
          <Link to="/caregiver" className="text-2xl font-black text-black flex items-center gap-2">
            <span>✨</span> AABHA Care
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3.5 rounded-2xl text-sm font-black transition ${
                location.pathname === item.path
                  ? 'bg-white border-2 border-black text-black shadow-sm'
                  : 'text-black hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t-2 border-gray-200 space-y-2">
          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="w-full p-3 flex items-center gap-3 text-black font-black rounded-2xl hover:bg-gray-50 border-2 border-transparent hover:border-gray-300 transition text-sm"
          >
            <Settings className="w-5 h-5 text-black" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full p-3 flex items-center gap-3 text-red-600 font-black rounded-2xl hover:bg-red-50 border-2 border-transparent hover:border-red-200 transition text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b-2 border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/caregiver" className="text-xl font-black text-black flex items-center gap-1.5">
              <span>✨</span> AABHA Care
            </Link>
          </div>

          <div className="hidden md:block">
            <h2 className="text-lg font-black text-black">
              Caregiver Portal • {user?.name || 'Priya Sharma'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white border-2 border-black text-black"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="md:hidden px-3 py-1.5 text-red-600 font-black text-xs border border-red-200 rounded-xl"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Mobile Horizontal Tabs */}
        <div className="md:hidden flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 overflow-x-auto">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition border ${
                location.pathname === item.path
                  ? 'bg-white border-black text-black shadow-xs'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Global Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};
