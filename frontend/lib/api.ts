import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      console.warn('Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface SlotObservation {
  id: string;
  slotName: string;
  location: string;
  amount: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSlotObservation {
  slotName: string;
  location: string;
  amount: number;
  status: string;
  notes?: string;
}

export interface DatabaseStatus {
  connected: boolean;
  type?: string;
  database?: string;
  host?: string;
  port?: number;
  error?: string;
}

export interface Statistics {
  total: number;
  totalAmount: number;
  averageAmount: number;
  statusDistribution: { status: string; count: number }[];
  locationDistribution: { location: string; count: number }[];
}

// Slot Observation APIs
export const slotApi = {
  getAll: () => api.get<SlotObservation[]>('/slots', {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    params: {
      _: Date.now() // Cache buster
    }
  }),
  getOne: (id: string) => api.get<SlotObservation>(`/slots/${id}`),
  create: (data: CreateSlotObservation) => api.post<SlotObservation>('/slots', data),
  update: (id: string, data: Partial<CreateSlotObservation>) => 
    api.patch<SlotObservation>(`/slots/${id}`, data),
  delete: (id: string) => api.delete(`/slots/${id}`),
};

// Database Management APIs
export const databaseApi = {
  getStatus: () => api.get<DatabaseStatus>('/database/status'),
  getTables: () => api.get<string[]>('/database/tables'),
  getTableInfo: (tableName: string) => api.get(`/database/tables/${tableName}`),
};

// Analytics APIs
export const analyticsApi = {
  getStatistics: () => api.get<Statistics>('/analytics/statistics'),
  getRecentActivity: (limit?: number) => 
    api.get<SlotObservation[]>('/analytics/recent', { params: { limit } }),
};

export default api;
