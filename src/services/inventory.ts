import { api } from '../lib/api';

export interface InventoryItem {
  id: number;
  name: string;
  unit: string;
  type: 'raw_material' | 'supplies';
  currentQuantity: number;
  minLevel: number;
  maxLevel: number;
  cost: number;
  status: 'in-stock' | 'low' | 'out-of-stock';
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Adjustment {
  id: number;
  inventoryItemId: number;
  amount: number;
  reason: string;
  createdAt: string;
  createdById: number;
  inventoryItem: InventoryItem;
  createdBy: {
    id: number;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    password: string;
    status: string;
    refreshToken: string;
    refreshTokenExpiresAt: string;
    roleId: number;
  };
}

export interface PaginatedAdjustments {
  adjustments: Adjustment[];
  total: number;
  page: number;
  limit: number;
}

// Get all adjustments
export const getAdjustments = async (params?: {
  date?: string;
  type?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedAdjustments> => {
  const response = await api.get<PaginatedAdjustments>('/adjustments', { params });
  return response.data;
};

// Create new adjustment
export const createAdjustment = async (data: {
  inventoryItemId: number;
  amount: number;
  reason?: string;
}): Promise<{ adjustment: Adjustment; inventoryItem: InventoryItem }> => {
  const response = await api.post<{ adjustment: Adjustment; inventoryItem: InventoryItem }>('/adjustments', data);
  return response.data;
};

// Get all inventory items
export const getInventory = async (params?: {
  low?: boolean;
  type?: 'raw_material' | 'supplies';
}): Promise<InventoryItem[]> => {
  const response = await api.get<InventoryItem[]>('/inventory', { params });
 // console.log('Inventory response:', response.data);
  return response.data;
};

// Get single inventory item by ID
export const getInventoryItem = async (id: string): Promise<InventoryItem> => {
  const response = await api.get<InventoryItem>(`/inventory/${id}`);
  return response.data;
};

// Create new inventory item
export const createInventoryItem = async (itemData: {
  name: string;
  unit: string;
  type: 'raw_material' | 'supplies';
  currentQuantity: number;
  minLevel: number;
  maxLevel: number;
  cost: number;
}): Promise<InventoryItem> => {
  const response = await api.post<{ success: true; data: InventoryItem }>('/inventory', itemData);
  return response.data.data;
};

// Update inventory item
export const updateInventoryItem = async (id: string, itemData: Partial<InventoryItem & { type: 'raw_material' | 'supplies' }>): Promise<InventoryItem> => {
  const response = await api.put<{ success: true; data: InventoryItem }>(`/inventory/${id}`, itemData);
  return response.data.data;
};

// Adjust inventory quantity
export const adjustQuantity = async (id: string, data: {
  quantity: number;
  action: 'add' | 'subtract';
  reason?: string;
}): Promise<InventoryItem> => {
  const response = await api.put<{ success: true; data: InventoryItem }>(`/inventory/${id}/quantity`, data);
  return response.data.data;
};

export const deleteInventoryItem = async (id:string) => {
  const response = await api.delete(`/inventory/${id}`);
  return response.data
}

export const inventoryService = {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getAdjustments,
  createAdjustment,
  adjustQuantity,
  getInventorySummary: async () => {
    const response = await api.get('/inventory/summary');
    return response.data;
  },
};