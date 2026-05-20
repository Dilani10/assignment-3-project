export interface User {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface LocationAddress {
  fullAddress: string;
  suburb: string;
  state: string;
  postcode: string;
}

export interface Preferences {
  weeklyBudget: number;
  duration: number;
  location: string;
  locationAddress: LocationAddress | null;
}

export interface GroceryItem {
  id: string;
  name: string;
}

export interface PriceData {
  [itemName: string]: {
    aldi: number;
    coles: number;
    woolworths: number;
  };
}

export interface SelectedItem {
  name: string;
  store: 'aldi' | 'coles' | 'woolworths';
  price: number;
  allPrices: {
    aldi: number;
    coles: number;
    woolworths: number;
  };
}

export type OptimizationType = 'cheapestItem' | 'singleStore' | 'within10km';

export interface AppState {
  user: User | null;
  preferences: Preferences;
  groceryItems: string[];
  optimizationType: OptimizationType;
  prices: PriceData;
  selectedItems: SelectedItem[];
}

export type PageName = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'preferences' 
  | 'grocery-list' 
  | 'basket-optimiser' 
  | 'price-comparison' 
  | 'confirmation';