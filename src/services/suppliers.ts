import { api } from '@/lib/api';

export interface Supplier {
  id: number;
  name: string;
  contactInfo?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderSummary {
  id: number;
  supplierId: number;
  totalCost: number;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: number;
  approvedById?: number;
}

export const suppliersService = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (supplier: { name: string; contactInfo?: string; email?: string; address?: string }): Promise<Supplier> => {
    const response = await api.post('/suppliers', supplier);
    return response.data;
  },

  update: async (id: number, supplier: Partial<{ name: string; contactInfo?: string; email?: string; address?: string }>): Promise<Supplier> => {
    const response = await api.put(`/suppliers/${id}`, supplier);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },

  getPOsBySupplier: async (id: number): Promise<PurchaseOrderSummary[]> => {
    const response = await api.get(`/suppliers/${id}/po`);
    return response.data;
  },
};