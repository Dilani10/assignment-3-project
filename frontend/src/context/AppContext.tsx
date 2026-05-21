import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AppState, User, Preferences, OptimizationType } from '../types';
import { generatePrices, getOptimizedItems } from '../utils/pricing';
import { apiService } from '../services/api';

interface WorkflowProgress {
  preferencesCompleted: boolean;
  groceryListCompleted: boolean;
  basketOptimiserCompleted: boolean;
  priceComparisonCompleted: boolean;
  confirmationCompleted: boolean;
}

interface AppContextType extends AppState {
  workflowProgress: WorkflowProgress;
  shoppingId: string | null;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setPreferences: (preferences: Preferences) => Promise<void>;
  addGroceryItem: (item: string) => void;
  removeGroceryItem: (item: string) => void;
  setOptimizationType: (type: OptimizationType) => void;
  generatePrices: () => void;
  optimizeItems: () => void;
  resetApp: () => void;
  logout: () => void;
  completePreferences: () => void;
  completeGroceryList: () => Promise<void>;
  completeBasketOptimiser: (optimizationType?: OptimizationType) => Promise<void>;
  completePriceComparison: () => void;
  completeConfirmation: () => Promise<void>;
  canAccessPage: (page: string) => boolean;
}

const defaultState: AppState = {
  user: null,
  preferences: {
    weeklyBudget: 0,
    duration: 1,
    location: '',
    locationAddress: null,
  },
  groceryItems: [],
  optimizationType: 'cheapestItem',
  prices: {},
  selectedItems: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress>({
    preferencesCompleted: false,
    groceryListCompleted: false,
    basketOptimiserCompleted: false,
    priceComparisonCompleted: false,
    confirmationCompleted: false,
  });
  const [shoppingId, setShoppingId] = useState<string | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  const setUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, user }));
  }, []);

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
  }, []);

  const setPreferences = useCallback(async (preferences: Preferences) => {
    setState(prev => ({ ...prev, preferences }));
    
    // Save to database if user is authenticated
    if (accessToken) {
      try {
        const response = await apiService.createShopping(accessToken, {
          weekly_budget: preferences.weeklyBudget,
          shopping_duration: preferences.duration,
          location: preferences.location
        });
        setShoppingId(response.shopping.id);
        console.log('Shopping instance created:', response.shopping.id);
      } catch (error) {
        console.error('Failed to create shopping instance:', error);
      }
    }
  }, [accessToken]);

  /**
   * Add a grocery item to the list
   * Uses functional setState to avoid stale closure issues
   * This ensures the function always uses the latest state
   */
  const addGroceryItem = useCallback((item: string) => {
    if (item.trim()) {
      setState(prev => {
        // Check for duplicates using the latest state
        if (!prev.groceryItems.includes(item.trim())) {
          return {
            ...prev,
            groceryItems: [...prev.groceryItems, item.trim()],
          };
        }
        return prev;
      });
    }
  }, []);

  const removeGroceryItem = useCallback((item: string) => {
    setState(prev => ({
      ...prev,
      groceryItems: prev.groceryItems.filter(i => i !== item),
    }));
  }, []);

  const setOptimizationType = useCallback((type: OptimizationType) => {
    setState(prev => ({ ...prev, optimizationType: type }));
  }, []);

  const generatePricesForItems = useCallback(() => {
    if (state.groceryItems.length > 0) {
      const newPrices = generatePrices(state.groceryItems);
      setState(prev => ({ ...prev, prices: newPrices }));
    }
  }, [state.groceryItems]);

  const optimizeItems = useCallback(() => {
    if (state.groceryItems.length > 0 && Object.keys(state.prices).length > 0) {
      const optimized = getOptimizedItems(state.prices, state.groceryItems, state.optimizationType);
      setState(prev => ({ ...prev, selectedItems: optimized }));
    }
  }, [state.groceryItems, state.prices, state.optimizationType]);

  /**
   * Automatically re-optimize items when dependencies change
   * This ensures selectedItems is always in sync with groceryItems, prices, and optimizationType
   * Treats optimization results as derived state
   * 
   * ROOT CAUSE FIX: Added check to ensure all items have prices before optimizing
   * This prevents errors when new items are added but prices haven't been generated yet
   */
  useEffect(() => {
    // Check if all items have prices before optimizing
    // This prevents errors when prices[item] is undefined for new items
    const allItemsHavePrices = state.groceryItems.every(item => state.prices[item]);
    
    if (state.groceryItems.length > 0 && allItemsHavePrices) {
      const optimized = getOptimizedItems(state.prices, state.groceryItems, state.optimizationType);
      setState(prev => ({ ...prev, selectedItems: optimized }));
    }
  }, [state.groceryItems, state.prices, state.optimizationType]);

  /**
   * Reset workflow progress - locks all steps except Preferences
   * Called when user clicks "Start New" to restart the workflow
   * This ensures navigation behaves like a first-time user
   */
  const resetWorkflowProgress = useCallback(() => {
    setWorkflowProgress({
      preferencesCompleted: false,
      groceryListCompleted: false,
      basketOptimiserCompleted: false,
      priceComparisonCompleted: false,
      confirmationCompleted: false,
    });
  }, []);

  /**
   * Reset entire application state including workflow progress
   * Used when starting a new shopping session
   * Ensures all navigation locks are restored
   */
  const resetApp = useCallback(() => {
    setState(prev => ({
      ...prev,
      preferences: {
        weeklyBudget: 0,
        duration: 1,
        location: '',
        locationAddress: null,
      },
      groceryItems: [],
      optimizationType: 'cheapestItem',
      prices: {},
      selectedItems: [],
    }));
    // Reset workflow progress to lock all steps except Preferences
    resetWorkflowProgress();
    // Clear shopping ID to ensure a new shopping instance is created for the next session
    setShoppingId(null);
  }, [resetWorkflowProgress]);

  const logout = useCallback(() => {
    setState(defaultState);
    setWorkflowProgress({
      preferencesCompleted: false,
      groceryListCompleted: false,
      basketOptimiserCompleted: false,
      priceComparisonCompleted: false,
      confirmationCompleted: false,
    });
    setShoppingId(null);
    setAccessTokenState(null);
  }, []);

  const completePreferences = useCallback(() => {
    setWorkflowProgress(prev => ({ ...prev, preferencesCompleted: true }));
  }, []);

  const completeGroceryList = useCallback(async () => {
    setWorkflowProgress(prev => ({ ...prev, groceryListCompleted: true }));
    
    // Note: Grocery items will be saved in completeConfirmation() with full price data
    // This prevents duplicate rows with NULL prices
  }, []);

  const completeBasketOptimiser = useCallback(async (optimizationType?: OptimizationType) => {
    setWorkflowProgress(prev => ({ ...prev, basketOptimiserCompleted: true }));
    
    // Update shopping instance with optimization choice
    if (accessToken && shoppingId) {
      try {
        // Use passed optimizationType or fall back to state
        const typeToUse = optimizationType || state.optimizationType;
        
        // Map frontend optimization type to database value
        let optimiserChoice: string;
        switch (typeToUse) {
          case 'cheapestItem':
            optimiserChoice = 'cheapest_item';
            break;
          case 'singleStore':
            optimiserChoice = 'cheapest_single_store';
            break;
          case 'within10km':
            optimiserChoice = 'cheapest_within_10km';
            break;
          default:
            optimiserChoice = 'cheapest_item';
        }
        
        await apiService.updateShopping(accessToken, shoppingId, {
          optimiser_choice: optimiserChoice
        });
        console.log('Shopping instance updated with optimization type:', optimiserChoice);
      } catch (error) {
        console.error('Failed to update shopping instance:', error);
      }
    }
  }, [accessToken, shoppingId, state.optimizationType]);

  const completePriceComparison = useCallback(() => {
    setWorkflowProgress(prev => ({ ...prev, priceComparisonCompleted: true }));
  }, []);

  const completeConfirmation = useCallback(async () => {
    setWorkflowProgress(prev => ({ ...prev, confirmationCompleted: true }));
    
    // Save final basket data to database in background (non-blocking)
    // This allows navigation to happen immediately without waiting for DB operations
    if (accessToken && shoppingId) {
      // Run database operations in background without awaiting
      (async () => {
        try {
          const totalBasketCost = state.selectedItems.reduce((sum, item) => sum + item.price, 0);
          const estimatedSavings = state.preferences.weeklyBudget - totalBasketCost;
          
          await apiService.updateShopping(accessToken, shoppingId, {
            total_basket_cost: totalBasketCost,
            estimated_savings: estimatedSavings > 0 ? estimatedSavings : 0
          });
          console.log('Final basket saved:', { totalBasketCost, estimatedSavings });
          
          // Update grocery items with prices
          if (state.selectedItems.length > 0) {
            const itemsWithPrices = state.selectedItems.map(item => ({
              item_name: item.name,
              aldi_price: state.prices[item.name]?.aldi || 0,
              coles_price: state.prices[item.name]?.coles || 0,
              woolworths_price: state.prices[item.name]?.woolworths || 0,
              highlighted_store: item.store
            }));
            await apiService.addGroceryItems(accessToken, shoppingId, itemsWithPrices);
          }
        } catch (error) {
          console.error('Failed to save final basket:', error);
        }
      })();
    }
  }, [accessToken, shoppingId, state.selectedItems, state.preferences.weeklyBudget, state.prices]);

  const canAccessPage = useCallback((page: string): boolean => {
    if (!state.user) return page === '/' || page === '/login' || page === '/register';
    
    switch (page) {
      case '/preferences':
        return true;
      case '/grocery-list':
        return workflowProgress.preferencesCompleted;
      case '/basket-optimiser':
        return workflowProgress.preferencesCompleted && workflowProgress.groceryListCompleted;
      case '/price-comparison':
        return workflowProgress.preferencesCompleted && workflowProgress.groceryListCompleted && workflowProgress.basketOptimiserCompleted;
      case '/confirmation':
        return workflowProgress.preferencesCompleted && workflowProgress.groceryListCompleted && workflowProgress.basketOptimiserCompleted && workflowProgress.priceComparisonCompleted;
      default:
        return true;
    }
  }, [state.user, workflowProgress]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        workflowProgress,
        shoppingId,
        accessToken,
        setUser,
        setAccessToken,
        setPreferences,
        addGroceryItem,
        removeGroceryItem,
        setOptimizationType,
        generatePrices: generatePricesForItems,
        optimizeItems,
        resetApp,
        logout,
        completePreferences,
        completeGroceryList,
        completeBasketOptimiser,
        completePriceComparison,
        completeConfirmation,
        canAccessPage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};