import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

interface Step {
  id: string;
  label: string;
  path: string;
}

const steps: Step[] = [
  { id: 'preferences', label: 'Preferences', path: '/preferences' },
  { id: 'grocery-list', label: 'Grocery List', path: '/grocery-list' },
  { id: 'basket-optimiser', label: 'Basket Optimiser', path: '/basket-optimiser' },
  { id: 'price-comparison', label: 'Price Comparison', path: '/price-comparison' },
  { id: 'confirmation', label: 'Confirmation', path: '/confirmation' },
];

const WorkflowNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workflowProgress, canAccessPage, user } = useAppContext();

  // Don't show workflow navbar if user is not logged in
  if (!user) return null;

  // Don't show on landing, login, or register pages
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const getStepStatus = (step: Step) => {
    const stepKey = `${step.id.replace('-', '')}Completed` as keyof typeof workflowProgress;
    const isCompleted = workflowProgress[stepKey];
    const isCurrent = location.pathname === step.path;
    const canAccess = canAccessPage(step.path);

    if (isCompleted) return 'completed';
    if (isCurrent) return 'current';
    if (canAccess) return 'accessible';
    return 'locked';
  };

  const handleStepClick = (step: Step) => {
    const status = getStepStatus(step);
    if (status !== 'locked') {
      navigate(step.path);
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/90 backdrop-blur-md shadow-lg border-b border-primary-100 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => {
              const status = getStepStatus(step);
              const isLast = index === steps.length - 1;

              return (
                <React.Fragment key={step.id}>
                    <motion.button
                      onClick={() => handleStepClick(step)}
                      disabled={status === 'locked'}
                      className={`
                        flex items-center px-4 py-2 rounded-xl text-lg font-medium transition-all duration-200
                        ${status === 'completed'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                          : status === 'current'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : status === 'accessible'
                              ? 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                              : 'bg-red-50 text-red-400 cursor-not-allowed opacity-50 pointer-events-none'
                        }
                      `}
                      whileHover={status !== 'locked' ? { scale: 1.05 } : {}}
                      whileTap={status !== 'locked' ? { scale: 0.95 } : {}}
                    >
                    {status === 'completed' ? (
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xl mr-2">
                        {index + 1}
                      </span>
                    )}
                    {step.label}
                  </motion.button>
                  
                  {!isLast && (
                    <div className={`
                      w-8 h-0.5 mx-1
                      ${status === 'completed' ? 'bg-emerald-500' : 'bg-secondary-200'}
                    `} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default WorkflowNavbar;