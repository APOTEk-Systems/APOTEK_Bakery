import { api } from '@/lib/api';

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  isCredit: boolean;
  creditLimit:number;
  currentCredit:number
  status: 'active' | 'inactive';
  loyaltyPoints: number;
  notes?: string;
  birthday?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrder?: string;
  favoriteItems?: Array<{ name: string; orders: number; lastOrdered: string }>;
  recentOrders?: Array<{
    id: string;
    date: string;
    total: number;
    status: 'completed' | 'pending' | 'cancelled';
    items: string;
  }>;
}

export const customersService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get('/customers');
    return response.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrder' | 'favoriteItems' | 'recentOrders'>): Promise<Customer> => {
    const response = await api.post('/customers', customer);
    return response.data;
  },

  update: async (id: number, customer: Partial<Customer>): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, customer);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};