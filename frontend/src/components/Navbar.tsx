import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

interface NavbarProps {
  showBack?: boolean;
  showLogout?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showBack = false, showLogout = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAppContext();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
        return 'OPTIMISED';
      case '/login':
        return 'Login';
      case '/register':
        return 'Register';
      case '/preferences':
        return 'Shopping Preferences';
      case '/grocery-list':
        return 'Grocery List';
      case '/basket-optimiser':
        return 'Basket Optimiser';
      case '/price-comparison':
        return 'Price Comparison';
      case '/confirmation':
        return 'Confirmation';
      default:
        return 'OPTIMISED';
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/90 backdrop-blur-md shadow-lg border-b border-primary-100 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Back button or Logo */}
          <div className="flex items-center">
            {showBack ? (
              <button
                onClick={handleBack}
                className="flex items-center text-secondary-600 hover:text-primary-600 transition-colors duration-200"
                aria-label="Go back"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="font-medium">Back</span>
              </button>
            ) : (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">O</span>
                </div>
              </div>
            )}
          </div>

          {/* Center - Page Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right side - User info and Logout */}
          <div className="flex items-center">
            {showLogout && user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-secondary-600">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-secondary-600 hover:text-red-600 transition-colors duration-200"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            )}
            {!showLogout && !showBack && (
              <div className="w-10"></div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;