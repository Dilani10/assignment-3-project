import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import FormSection from '../components/FormSection';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';

const GroceryList: React.FC = () => {
  const navigate = useNavigate();
  
  // Safe context access with error handling
  // This prevents blank screen if context is temporarily undefined during navigation
  let contextValue;
  try {
    contextValue = useAppContext();
  } catch (error) {
    // Context not available yet - show loading state
    console.log('AppContext not available during GroceryList render:', error);
    return (
      <PageLayout showBack>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg text-secondary-600">Loading grocery list...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Destructure with safe fallbacks
  const { 
    groceryItems = [], 
    addGroceryItem = () => {}, 
    removeGroceryItem = () => {}, 
    generatePrices = () => {}, 
    completeGroceryList = () => {} 
  } = contextValue || {};

  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Debug logging to help identify state issues
  console.log('GroceryList rendered with groceryItems:', groceryItems);

  const categories = [
    { id: 'all', name: 'All', icon: '🛒' },
    { id: 'fruits', name: 'Fruits', icon: '🍎' },
    { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
    { id: 'dairy', name: 'Dairy', icon: '🥛' },
    { id: 'meat', name: 'Meat', icon: '🥩' },
    { id: 'bakery', name: 'Bakery', icon: '🍞' },
    { id: 'pantry', name: 'Pantry', icon: '🥫' },
  ];

  const suggestions = [
    'Milk', 'Bread', 'Eggs', 'Butter', 'Cheese', 'Chicken', 'Rice', 'Pasta','Tomatoes', 'Onions', 'Potatoes', 'Bananas', 'Apples', 'Yogurt', 'Cereal'
  ];

  const handleAddItem = () => {
    if (newItem.trim()) {
      addGroceryItem(newItem.trim());
      setNewItem('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleContinue = async () => {
    // Defensive check: ensure groceryItems is an array and has items
    if (Array.isArray(groceryItems) && groceryItems.length > 0) {
      generatePrices();
      await completeGroceryList();
      navigate('/basket-optimiser');
    }
  };

  // Defensive check: ensure groceryItems is always an array
  const safeGroceryItems = Array.isArray(groceryItems) ? groceryItems : [];

  return (
    <PageLayout showBack>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <FormSection
            title="Grocery List"
            subtitle="Add items to your shopping list"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
          >
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-medium text-secondary-700">Step 2 of 4</span>
                <span className="text-lg font-medium text-secondary-500">50% complete</span>
              </div>
              <div className="w-full bg-secondary-300 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full w-2/4"></div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                      ${selectedCategory === category.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                        : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                      }
                    `}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add Item Input */}
            <div className="mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter grocery item"
                    className="w-full px-4 py-3 border-2 border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  />
                  <button
                    onClick={handleAddItem}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Suggestions */}
            <div className="mb-6">
              <p className="text-lg font-medium text-secondary-700 mb-3">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 8).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => addGroceryItem(suggestion)}
                    className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-full text-base hover:bg-emerald-100 hover:text-emerald-700 transition-colors duration-200"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Grocery Items List */}
            <div className="mb-6">
              {safeGroceryItems.length === 0 ? (
                <div className="text-center py-8 text-secondary-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">Your grocery list is empty</p>
                  <p className="text-base">Add items to get started</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence>
                    {safeGroceryItems.map((item, index) => (
                      <motion.li
                        key={`item-${index}-${item}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-emerald-50 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="text-secondary-800 font-medium">{item}</span>
                        </div>
                        <button
                          onClick={() => removeGroceryItem(item)}
                          className="p-2 text-secondary-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          aria-label={`Remove ${item}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
            
            {/* Item Count & Continue */}
            {safeGroceryItems.length > 0 && (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-base font-bold shadow-lg">
                    {safeGroceryItems.length} {safeGroceryItems.length === 1 ? 'item' : 'items'} added
                  </span>
                </div>
                
                <Button
                  onClick={handleContinue}
                  fullWidth
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Continue to Optimiser
                </Button>
              </div>
            )}
          </FormSection>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default GroceryList;
