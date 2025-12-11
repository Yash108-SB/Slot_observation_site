import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
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
