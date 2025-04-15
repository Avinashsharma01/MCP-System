import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://mcp-server-z5mr.onrender.com/api';

// Create axios instance with baseURL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout
  timeout: 10000,
});

// Add request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token included in request');
    } else {
      console.log('No token available');
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      
      // Handle 401 Unauthorized error
      if (error.response.status === 401) {
        console.log('Authentication error - clearing token');
        localStorage.removeItem('token');
        toast.error('Your session has expired. Please login again.');
        window.location.href = '/login';
      }
      
      // Handle 404 Not Found
      if (error.response.status === 404) {
        console.error('API endpoint not found:', error.config.url);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      toast.error('Server not responding. Please try again later.');
    } else {
      console.error('Error message:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  // Register user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update user profile
  updateProfile: (data) => api.put('/auth/profile', data),
  
  // Change password
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Partner services
export const partnerService = {
  // Get all partners
  getPartners: () => api.get('/partners'),
  
  // Get partner by ID
  getPartner: (id) => api.get(`/partners/${id}`),
  
  // Create new partner (MCP only)
  createPartner: (data) => {
    console.log('Creating partner with data:', data);
    return api.post('/partners/add', data);
  },
  
  // Update partner
  updatePartner: (id, data) => api.put(`/partners/${id}`, data),
  
  // Delete partner
  deletePartner: (id) => api.delete(`/partners/${id}`),
};

// Wallet services
export const walletService = {
  getWallet: async () => {
    try {
      const response = await api.get('/wallet');
      return response;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      throw error;
    }
  },

  getTransactions: async (filters = {}) => {
    try {
      const response = await api.get('/wallet/transactions', {
        params: filters
      });
      return response;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  addFunds: async (data) => {
    try {
      const response = await api.post('/wallet/add-funds', data);
      return response;
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  },

  withdrawFunds: async (data) => {
    try {
      const response = await api.post('/wallet/withdraw', data);
      return response;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  }
};

// Pickup services
export const pickupService = {
  // Request pickup
  requestPickup: (data) => api.post('/pickups/request', data),
  
  // Get all pickups
  getPickups: () => api.get('/pickups'),
  
  // Get pickup by ID
  getPickup: (id) => api.get(`/pickups/${id}`),
  
  // Update pickup status
  updatePickupStatus: (id, status) => api.put(`/pickups/${id}/status`, { status }),
  
  // Schedule pickup
  schedulePickup: (id, scheduledTime) => api.put(`/pickups/${id}/schedule`, { scheduledTime }),
  
  // Cancel pickup
  cancelPickup: (id, reason) => api.put(`/pickups/${id}/cancel`, { reason }),
};

// Order services
export const orderService = {
  // Create order
  createOrder: (data) => api.post('/orders', data),
  
  // Get all orders
  getOrders: () => api.get('/orders'),
  
  // Get order by ID
  getOrder: (id) => api.get(`/orders/${id}`),
  
  // Update order status
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  
  // Cancel order
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  
  // Get order history
  getOrderHistory: () => api.get('/orders/history'),
};

export default api; 