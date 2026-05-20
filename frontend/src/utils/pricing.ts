import { PriceData, SelectedItem, OptimizationType } from '../types';

// Generate realistic random prices for items across stores
export const generatePrices = (items: string[]): PriceData => {
  const prices: PriceData = {};
  
  items.forEach(item => {
    // Base price between $2 and $15
    const basePrice = 2 + Math.random() * 13;
    
    // Fair pricing: All stores compete equally with overlapping ranges
    // Each store has 85-115% of base price, ensuring no bias
    
    const aldiPrice = basePrice * (0.85 + Math.random() * 0.30); // 85-115% of base
    const colesPrice = basePrice * (0.85 + Math.random() * 0.30); // 85-115% of base
    const woolworthsPrice = basePrice * (0.85 + Math.random() * 0.30); // 85-115% of base
    
    prices[item] = {
      aldi: Math.round(aldiPrice * 100) / 100,
      coles: Math.round(colesPrice * 100) / 100,
      woolworths: Math.round(woolworthsPrice * 100) / 100,
    };
  });
  
  return prices;
};

// Get the cheapest item across all stores
export const getCheapestItem = (prices: PriceData, items: string[]): SelectedItem[] => {
  return items.map(item => {
    const itemPrices = prices[item];
    const stores = Object.entries(itemPrices) as [string, number][];
    let cheapestStore: 'aldi' | 'coles' | 'woolworths' = 'aldi';
    let cheapestPrice = itemPrices.aldi;
    
    stores.forEach(([store, price]) => {
      if (price < cheapestPrice) {
        cheapestPrice = price;
        cheapestStore = store as 'aldi' | 'coles' | 'woolworths';
      }
    });
    
    return {
      name: item,
      store: cheapestStore,
      price: cheapestPrice,
      allPrices: itemPrices,
    };
  });
};

// Get cheapest single store for all items
export const getCheapestSingleStore = (prices: PriceData, items: string[]): SelectedItem[] => {
  const stores = ['aldi', 'coles', 'woolworths'] as const;
  
  // Calculate total for each store
  const storeTotals = stores.map(store => ({
    store,
    total: items.reduce((sum, item) => sum + prices[item][store], 0),
  }));
  
  // Find cheapest store
  const cheapestStore = storeTotals.reduce((min, current) => 
    current.total < min.total ? current : min
  ).store;
  
  // Return all items from cheapest store
  return items.map(item => ({
    name: item,
    store: cheapestStore,
    price: prices[item][cheapestStore],
    allPrices: prices[item],
  }));
};

// Get cheapest items within 10km (same logic as single store for demo)
export const getCheapestWithin10km = (prices: PriceData, items: string[]): SelectedItem[] => {
  // For this demo, we'll use the same logic as cheapestItem
  // In a real app, this would filter by store locations
  return getCheapestItem(prices, items);
};

// Calculate total basket value
export const calculateTotal = (selectedItems: SelectedItem[]): number => {
  return selectedItems.reduce((sum, item) => sum + item.price, 0);
};

// Calculate savings
export const calculateSavings = (budget: number, total: number): number => {
  return Math.max(0, budget - total);
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
};

// Get optimization function based on type
export const getOptimizedItems = (
  prices: PriceData, 
  items: string[], 
  optimizationType: OptimizationType
): SelectedItem[] => {
  switch (optimizationType) {
    case 'cheapestItem':
      return getCheapestItem(prices, items);
    case 'singleStore':
      return getCheapestSingleStore(prices, items);
    case 'within10km':
      return getCheapestWithin10km(prices, items);
    default:
      return getCheapestItem(prices, items);
  }
};

// Get store display name
export const getStoreDisplayName = (store: 'aldi' | 'coles' | 'woolworths'): string => {
  const names = {
    aldi: 'Aldi',
    coles: 'Coles',
    woolworths: 'Woolworths',
  };
  return names[store];
};

// Get store color class
export const getStoreColorClass = (store: 'aldi' | 'coles' | 'woolworths'): string => {
  const colors = {
    aldi: 'text-blue-600 bg-blue-100',
    coles: 'text-red-600 bg-red-100',
    woolworths: 'text-green-600 bg-green-100',
  };
  return colors[store];
};