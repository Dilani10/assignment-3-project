import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { user, canAccessPage } = useAppContext();

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user can access this page
  if (!canAccessPage(location.pathname)) {
    // Redirect to the latest accessible page
    if (canAccessPage('/preferences')) {
      return <Navigate to="/preferences" replace />;
    } else if (canAccessPage('/grocery-list')) {
      return <Navigate to="/grocery-list" replace />;
    } else if (canAccessPage('/basket-optimiser')) {
      return <Navigate to="/basket-optimiser" replace />;
    } else if (canAccessPage('/price-comparison')) {
      return <Navigate to="/price-comparison" replace />;
    } else {
      return <Navigate to="/confirmation" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;