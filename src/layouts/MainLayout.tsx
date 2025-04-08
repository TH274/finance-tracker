import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Home, CreditCard, PieChart, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../themes/ThemeContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const { mode, toggleTheme } = useTheme();

  const navigationItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Transactions', icon: CreditCard, path: '/transactions' },
    { name: 'Budget', icon: PieChart, path: '/budget' },
    { name: 'Settings', icon: SettingsIcon, path: '/settings' },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">FinTrack</h1>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
            >
              {mode === 'light' ? (
                <div className="h-5 w-5 text-gray-700">🌙</div>
              ) : (
                <div className="h-5 w-5 text-yellow-300">☀️</div>
              )}
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <motion.div
        className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: sidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar}></div>
        <motion.aside
          className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 transition-colors duration-200"
          initial={{ x: '-100%' }}
          animate={{ x: sidebarOpen ? 0 : '-100%' }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute top-0 right-0 pt-2 pr-2">
            <button
              onClick={toggleSidebar}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
            >
              <X className="h-6 w-6 text-gray-600 dark:text-gray-300" aria-hidden="true" />
              <span className="sr-only">Close sidebar</span>
            </button>
          </div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">FinTrack</h1>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
            >
              {mode === 'light' ? (
                <div className="h-5 w-5 text-gray-700">🌙</div>
              ) : (
                <div className="h-5 w-5 text-yellow-300">☀️</div>
              )}
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  onClick={toggleSidebar}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                handleLogout();
                toggleSidebar();
              }}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Logout
            </button>
          </div>
        </motion.aside>
      </motion.div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10 transition-colors duration-200 md:hidden">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
              <span className="sr-only">Open sidebar</span>
            </button>
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">FinTrack</h1>
            <div className="w-6"></div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <div className="py-6 mx-auto px-4 sm:px-6 md:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 