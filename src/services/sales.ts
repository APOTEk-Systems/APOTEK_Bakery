import { api } from '@/lib/api';

export interface SalesQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isCredit?:boolean;
  status?: 'completed' | 'unpaid';
  createdAt?: number;
  startDate?: string;
  endDate?: string;
  customerId?: number;
  customerName?: string;
}

export interface PaginatedSalesResponse {
  sales: Sale[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface SaleItem {
  id?: number;
  saleId?: number;
  productId: number;
  quantity: number;
  price: number;
  name: string;
}

export interface Sale {
  id: number;
  customerId?: number;
  customerName?: string;
  soldById?: number;
  isCredit?: boolean;
  creditDueDate?: string;
  total: number;
  tax: number;
  paymentMethod?: 'cash' | 'card' | 'mobile' | 'credit';
  status: 'completed' | 'unpaid';
  paymentStatus?: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: SaleItem[];
  customer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  soldBy: string;
  outstandingBalance?: number;
  paid?: number;
}

export interface Payment {
  id: number;
  amount: number;
  customerId: number;
  saleId: number;
  paymentDate: string;
  notes?: string;
  customer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  instructions?: string;
  product?: {
    id: number;
    name: string;
    price: number;
  };
}

export interface Order {
  id: number;
  customerId?: number;
  customerName?: string;
  totalAmount: number;
  status: 'completed' | 'unpaid';
  orderDate: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  customer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
}

export const salesService = {
  // Sales
  getAllSales: async (params: SalesQueryParams = {}): Promise<Sale[]> => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  getPaginatedSales: async (params: SalesQueryParams = {}): Promise<PaginatedSalesResponse> => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  getSaleById: async (id: number): Promise<Sale> => {
    const response = await api.get(`/sales/${id}`);
    console.log(response.data)
    return response.data;
  },

  createSale: async (saleData: { customerId?: number; items: SaleItem[]; paymentMethod?: string; notes?: string; isCredit?: boolean; total?: number; amountReceived?: number; }): Promise<Sale> => {
    const requestData = {
      ...saleData,
      ...(saleData.isCredit !== undefined && { isCredit: saleData.isCredit }),
      ...(saleData.total !== undefined && { total: saleData.total })
    };
    const response = await api.post('/sales', requestData);
    return response.data;
  },

  updateSale: async (id: number, updateData: Partial<Sale>): Promise<Sale> => {
    const response = await api.put(`/sales/${id}`, updateData);
    return response.data;
  },

  refundSale: async (id: number): Promise<Sale> => {
    const response = await api.patch(`/sales/${id}/refund`);
    return response.data;
  },

  paySale: async (id: number): Promise<Sale> => {
    const response = await api.patch(`/sales/${id}/pay`);
    return response.data;
  },

  deleteSale: async (id: number): Promise<void> => {
    await api.delete(`/sales/${id}`);
  },

  // Orders
  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData: { customerId?: number; items: OrderItem[]; dueDate?: string; notes?: string; }): Promise<Order> => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateOrder: async (id: number, updateData: Partial<Order>): Promise<Order> => {
    const response = await api.put(`/orders/${id}`, updateData);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: Order['status']): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  deleteOrder: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  getSalesSummary: async () => {
    const response = await api.get('/sales/summary');
    //console.log(response.data)
    return response.data;
  },

  getSalesDashboard: async () => {
    const response = await api.get('/sales/dashboard');
    return response.data;
  },

  // Payments
  createPayment: async (saleId: number, amount: number): Promise<Payment> => {
    const response = await api.post(`/sales/${saleId}/payments`, { amount });
    return response.data;
  },

  getAllPayments: async (): Promise<Payment[]> => {
    const response = await api.get('/sales/payments');
    return response.data;
  },

  getPaymentsForSale: async (saleId: number): Promise<Payment[]> => {
    const response = await api.get(`/sales/${saleId}/payments`);
    return response.data;
  },
};