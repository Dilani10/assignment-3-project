import React, { ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import WorkflowNavbar from './WorkflowNavbar';
import { useAppContext } from '../context/AppContext';

interface PageLayoutProps {
  children: ReactNode;
  showBack?: boolean;
  showLogout?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  showBack = false, 
  showLogout = false 
}) => {
  const location = useLocation();
  const { user } = useAppContext();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Determine if this is a workflow page (logged in and not landing/login/register)
  const isWorkflowPage = user && 
    location.pathname !== '/' && 
    location.pathname !== '/login' && 
    location.pathname !== '/register';
  return (
    <div className="min-h-screen relative">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 -z-20" />
      
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 -z-10 aurora-bg" />
      
      {/* Navigation */}
      {isWorkflowPage ? (
        <WorkflowNavbar />
      ) : (
        <Navbar showBack={showBack} showLogout={showLogout} />
      )}
      
      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </motion.main>
      
      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-white/80 text-sm">
        <p>&copy; {new Date().getFullYear()} OPTIMISED. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PageLayout;