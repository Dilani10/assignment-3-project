import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import FormSection from '../components/FormSection';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, calculateTotal, calculateSavings, getStoreDisplayName, getStoreColorClass } from '../utils/pricing';
import { OptimizationType } from '../types';

const Confirmation: React.FC = () => {
  const navigate = useNavigate();
  const { 
    preferences, 
    groceryItems, 
    selectedItems, 
    optimizationType,
    resetApp, 
    logout,
    completeConfirmation
  } = useAppContext();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const totalBasketValue = calculateTotal(selectedItems);
  const totalSavings = calculateSavings(preferences.weeklyBudget, totalBasketValue);
  const itemCount = groceryItems.length;

  /**
   * Get the display name for the optimization strategy
   * Maps the optimization type to a user-friendly name
   */
  const getOptimizationStrategyName = (type: OptimizationType): string => {
    switch(type) {
      case 'cheapestItem': return 'Cheapest Item';
      case 'singleStore': return 'Cheapest Single Store';
      case 'within10km': return 'Cheapest Within 10km';
      default: return type;
    }
  };

  const handleSave = async () => {
    // Show popup immediately for instant feedback
    alert('Your optimised basket has been saved!');
    // Save to database in background (non-blocking)
    completeConfirmation();
  };

  const handleStartNew = () => {
    // Don't call completeConfirmation() here - it was already called in handleSave
    // This prevents duplicate saves to the database
    resetApp();
    navigate('/preferences');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <PageLayout showBack showLogout>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <FormSection
            title="Confirmation"
            subtitle="Your optimised grocery basket"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            {/* Celebration Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-center mb-6"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-5xl font-bold text-emerald-700 mb-2">Congratulations!</h2>
              <p className="text-xl font-bold text-emerald-600">Your basket has been optimised</p>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 text-center"
              >
                <div className="text-3xl font-bold text-emerald-700">
                  {formatCurrency(totalBasketValue)}
                </div>
                <div className="text-lg  text-emerald-600">Total Value</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 text-center"
              >
                <div className="text-3xl font-bold text-blue-700">
                  {formatCurrency(totalSavings)}
                </div>
                <div className="text-lg text-blue-600">Savings</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 text-center"
              >
                <div className="text-3xl font-bold text-purple-700">
                  {itemCount}
                </div>
                <div className="text-lg  text-purple-600">Items</div>
              </motion.div>
            </div>

            {/* Item-Level Optimised Basket Breakdown */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-secondary-800">Your Optimised Basket</h3>
                {/* Optimization Strategy Badge */}
                <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-full">
                  {getOptimizationStrategyName(optimizationType)}
                </span>
              </div>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 max-h-80 overflow-y-auto border border-emerald-200">
                <ul className="space-y-3">
                  {selectedItems.map((item, index) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-secondary-800">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Store Badge */}
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStoreColorClass(item.store)}`}>
                          {getStoreDisplayName(item.store)}
                        </span>
                        {/* Price */}
                        <span className="text-lg font-bold text-emerald-700">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-secondary-800 mb-3">Share Your Savings</h3>
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={handleSave}
                  fullWidth
                  size="lg"
                  className="text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Basket
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  onClick={handleStartNew}
                  variant="secondary"
                  fullWidth
                  size="lg"
                  className="text-lg flex items-center justify-center"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Start New
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  fullWidth
                  size="lg"
                  className="text-lg text-red-600 border-red-300 hover:bg-red-50 flex items-center justify-center"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </Button>
              </motion.div>
            </div>

            {/* Star Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-8 pt-6 border-t border-secondary-200"
            >
              <h3 className="text-2xl text-center text-secondary-700 font-bold mb-4">
                How was your experience?
              </h3>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className={`text-5xl transition-all duration-200 transform hover:scale-110 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-300 drop-shadow-lg'
                        : 'text-secondary-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-secondary-600 mt-2 text-lg">
                  You rated: {rating} star{rating > 1 ? 's' : ''}
                </p>
              )}
            </motion.div>
          </FormSection>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Confirmation;
