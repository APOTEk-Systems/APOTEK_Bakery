import { api } from '@/lib/api';

export interface PurchaseOrderItem {
  id?: number;
  purchaseOrderId?: number;
  inventoryItemId: number;
  quantity: number;
  price:number
}

export interface PurchaseOrder {
  id: number;
  supplierId: number;
  totalCost: number;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: number;
  approvedById?: number;
  items: PurchaseOrderItem[];
  goodsReceipts?: GoodsReceipt[];
}

export interface GoodsReceiptItem {
  inventoryItemId: number;
  receivedQuantity: number;
}

export interface GoodsReceipt {
  id: number;
  purchaseOrderId: number;
  receivedQuantity: number;
  status: 'pending' | 'completed';
  receivedDate?: string;
  notes?: string;
  createdById?: number;
}

export const purchasesService = {
  //Purchases Summary

  getPurchaseSummary : async ()=>{
    const response = await api.get(`/purchases/summary`);
    return response.data;
  },

  getPurchasesDashboard: async () => {
    const response = await api.get('/purchases/dashboard');
    return response.data;
  },
  // Purchase Orders
  getAllPOs: async (): Promise<PurchaseOrder[]> => {
    const response = await api.get('/purchases/orders');
    return response.data;
  },

  getPOById: async (id: number): Promise<PurchaseOrder> => {
    const response = await api.get(`/purchases/orders/${id}`);
   // console.log(response.data)
    return response.data;
  },

  createPO: async (poData: { supplierId: number; items: PurchaseOrderItem[]; totalCost?: number }): Promise<PurchaseOrder> => {
    const response = await api.post('/purchases/orders', poData);
    return response.data;
  },

  updatePO: async (id: number, updateData: { status?: string; approvedById?: number }): Promise<PurchaseOrder> => {
    const response = await api.put(`/purchases/orders/${id}`, updateData);
    return response.data;
  },

  updatePOStatus: async (id: number, status: string): Promise<PurchaseOrder> => {
    const response = await api.patch(`purchases/orders/${id}/status`, { status });
    console.log(response.data)
    return response.data;
  },

  deletePO: async (id: number): Promise<void> => {
    await api.delete(`/purchases/orders/${id}`);
  },

  // Goods Receipts
  getAllReceipts: async (): Promise<GoodsReceipt[]> => {
    const response = await api.get('/purchases/receiving');
    return response.data;
  },

  getReceiptById: async (id: number): Promise<GoodsReceipt> => {
    const response = await api.get(`/purchases/receiving/${id}`);
    return response.data;
  },

  createReceipt: async (receiptData: { purchaseOrderId: number; items: GoodsReceiptItem[] }): Promise<GoodsReceipt> => {
    const response = await api.post('/purchases/receiving', receiptData);
    return response.data;
  },

  updateReceipt: async (id: number, updateData: { status?: string }): Promise<GoodsReceipt> => {
    const response = await api.put(`/purchases/receiving/${id}`, updateData);
    return response.data;
  },

  deleteReceipt: async (id: number): Promise<void> => {
    await api.delete(`/purchases/receiving/${id}`);
  },
};