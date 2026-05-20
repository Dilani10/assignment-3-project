/**
 * API Service Layer for Shopping Optimiser
 * Handles all communication with the backend API
 * 
 * SECURITY NOTE: This is a learning backend implementation.
 * In production, tokens should be verified properly with JWKS and proper JWT validation.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  session: {
    access_token: string | null;
    refresh_token: string | null;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Register a new user
   * The backend will create a Supabase Auth user and the database trigger will create a profile
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const params = new URLSearchParams({
      email: credentials.email,
      password: credentials.password,
      first_name: credentials.firstName,
      last_name: credentials.lastName
    });

    const response = await fetch(`${this.baseUrl}/api/auth/register?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  }

  /**
   * Login user with email and password
   * Returns access token and refresh token
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const params = new URLSearchParams({
      email: credentials.email,
      password: credentials.password
    });

    const response = await fetch(`${this.baseUrl}/api/auth/login?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  }

  /**
   * Get current user information from access token
   */
  async getCurrentUser(token: string): Promise<{ user: User }> {
    const response = await fetch(`${this.baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user');
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ session: { access_token: string; refresh_token: string } }> {
    const params = new URLSearchParams({
      refresh_token_str: refreshToken
    });

    const response = await fetch(`${this.baseUrl}/api/auth/refresh?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return response.json();
  }

  /**
   * Logout user by invalidating their session
   */
  async logout(token: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return response.json();
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<{ status: string; database: string; service: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  // Shopping API Methods
  
  /**
   * Create a new shopping instance
   */
  async createShopping(
    token: string,
    data: {
      weekly_budget: number;
      shopping_duration: number;
      location: string;
    }
  ): Promise<{ message: string; shopping: any }> {
    const params = new URLSearchParams({
      weekly_budget: data.weekly_budget.toString(),
      shopping_duration: data.shopping_duration.toString(),
      location: data.location
    });

    const response = await fetch(`${this.baseUrl}/api/shopping?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create shopping instance');
    }

    return response.json();
  }

  /**
   * Update shopping instance with optimization results
   */
  async updateShopping(
    token: string,
    shoppingId: string,
    data: {
      optimiser_choice?: string;
      total_basket_cost?: number;
      estimated_savings?: number;
    }
  ): Promise<{ message: string; shopping: any }> {
    const params = new URLSearchParams();
    if (data.optimiser_choice) params.append('optimiser_choice', data.optimiser_choice);
    if (data.total_basket_cost !== undefined) params.append('total_basket_cost', data.total_basket_cost.toString());
    if (data.estimated_savings !== undefined) params.append('estimated_savings', data.estimated_savings.toString());

    const response = await fetch(`${this.baseUrl}/api/shopping/${shoppingId}?${params}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update shopping instance');
    }

    return response.json();
  }

  /**
   * Add grocery items to a shopping instance
   */
  async addGroceryItems(
    token: string,
    shoppingId: string,
    items: Array<{
      item_name: string;
      aldi_price?: number;
      coles_price?: number;
      woolworths_price?: number;
      highlighted_store?: string;
    }>
  ): Promise<{ message: string; items: any[] }> {
    const response = await fetch(`${this.baseUrl}/api/shopping/${shoppingId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add grocery items');
    }

    return response.json();
  }

  /**
   * Get all shopping instances for the current user
   */
  async getUserShoppings(token: string): Promise<{ shoppings: any[] }> {
    const response = await fetch(`${this.baseUrl}/api/shopping`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get shopping history');
    }

    return response.json();
  }

  /**
   * Get a specific shopping instance with all its items
   */
  async getShoppingDetails(token: string, shoppingId: string): Promise<{ shopping: any }> {
    const response = await fetch(`${this.baseUrl}/api/shopping/${shoppingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get shopping details');
    }

    return response.json();
  }

  /**
   * Delete a shopping instance
   */
  async deleteShopping(token: string, shoppingId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/shopping/${shoppingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete shopping instance');
    }

    return response.json();
  }
}

// Export singleton instance
export const apiService = new ApiService(API_BASE_URL);
