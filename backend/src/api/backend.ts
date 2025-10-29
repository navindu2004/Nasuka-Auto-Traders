// Backend API client
const API_BASE_URL = 'https://backend.youware.com';

// Generic API call function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Get current user info from platform
export async function getUserInfo() {
  try {
    const response = await fetch(`${API_BASE_URL}/__user_info__`);
    const result = await response.json();
    
    if (result.code === 0) {
      return result.data;
    }
    
    throw new Error(result.message || 'Failed to get user info');
  } catch (error) {
    console.error('Get user info error:', error);
    throw error;
  }
}

// Car APIs
export const carAPI = {
  getAll: (filters?: {
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return apiCall<any>(`/api/cars${query ? `?${query}` : ''}`);
  },

  getById: (id: number) => apiCall<any>(`/api/cars/${id}`),

  create: (carData: any) => apiCall<any>('/api/cars', {
    method: 'POST',
    body: JSON.stringify(carData),
  }),

  update: (id: number, carData: any) => apiCall<any>(`/api/cars/${id}`, {
    method: 'PUT',
    body: JSON.stringify(carData),
  }),

  delete: (id: number) => apiCall<any>(`/api/cars/${id}`, {
    method: 'DELETE',
  }),
};

// Order APIs
export const orderAPI = {
  create: (orderData: {
    car_id: number;
    shipping_address: string;
    contact_email: string;
    contact_phone: string;
    display_name?: string;
    photo_url?: string;
    user_email?: string;
    user_phone?: string;
    notes?: string;
  }) => apiCall<any>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),

  getAll: () => apiCall<any>('/api/orders'),

  getById: (id: number) => apiCall<any>(`/api/orders/${id}`),
};

// User APIs
export const userAPI = {
  getProfile: () => apiCall<any>('/api/user/profile'),

  updateProfile: (profileData: {
    display_name?: string;
    photo_url?: string;
    email?: string;
    phone?: string;
    shipping_address?: string;
  }) => apiCall<any>('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
};

// Admin APIs
export const adminAPI = {
  checkAdmin: () => apiCall<any>('/api/admin/check'),

  getAllOrders: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiCall<any>(`/api/admin/orders${query}`);
  },

  updateOrderStatus: (orderId: number, statusData: {
    status: string;
    description?: string;
    location?: string;
  }) => apiCall<any>(`/api/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
  }),

  addMarketData: (data: any) => apiCall<any>('/api/admin/market-data', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Market data API
export const marketDataAPI = {
  get: (make?: string, model?: string) => {
    const params = new URLSearchParams();
    if (make) params.append('make', make);
    if (model) params.append('model', model);
    const query = params.toString();
    return apiCall<any>(`/api/market-data${query ? `?${query}` : ''}`);
  },
};
