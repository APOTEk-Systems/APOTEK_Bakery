import { api } from "@/lib/api";

export interface SalesAdjustment {
  id: number;
  saleId: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  createdAt: string;
  requestedBy: {
    id: number;
    name: string;
  };
  approvedBy?: {
    id: number;
    name: string;
  };
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    notes?: string;
    product?: {
      id: number;
      name: string;
      price: number;
    };
  }>;
  sale?: {
    id: number;
    customer?: {
      name: string;
    };
    total: number;
    createdAt: string;
  };
}

export interface SalesAdjustmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  saleId?: string;
}

export interface PaginatedSalesAdjustmentsResponse {
  returns: SalesAdjustment[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface CreateSalesAdjustmentData {
  saleId: number;
  reason: string;
  items: Array<{
    productId: number;
    quantity: number;
    notes?: string;
  }>;
}

export const salesAdjustmentsService = {
  // Get all sales adjustments with pagination
  getAll: async (params: SalesAdjustmentQueryParams = {}): Promise<PaginatedSalesAdjustmentsResponse> => {
    const response = await api.get('/sales-adjustments', { params });
    return response.data;
  },

  // Get a specific sales adjustment by ID
  getById: async (id: number): Promise<SalesAdjustment> => {
    const response = await api.get(`/sales-adjustments/${id}`);
    return response.data;
  },

  // Get sales adjustments for a specific sale
  getBySaleId: async (saleId: number): Promise<SalesAdjustment[]> => {
    const response = await api.get('/sales-adjustments', { 
      params: { 
        saleId: saleId.toString(),
        limit: 1 
      } 
    });
    return response.data.returns || [];
  },

  // Create a new sales adjustment (return request)
  create: async (data: CreateSalesAdjustmentData): Promise<SalesAdjustment> => {
    const response = await api.post('/sales-adjustments', data);
    return response.data;
  },

  // Approve a sales adjustment
  approve: async (id: number): Promise<SalesAdjustment> => {
    const response = await api.patch(`/sales-adjustments/${id}/approve`);
    return response.data;
  },

  // Decline a sales adjustment
  decline: async (id: number): Promise<SalesAdjustment> => {
    const response = await api.patch(`/sales-adjustments/${id}/decline`);
    return response.data;
  },

  // Delete a sales adjustment
  delete: async (id: number): Promise<void> => {
    await api.delete(`/sales-adjustments/${id}`);
  },
};