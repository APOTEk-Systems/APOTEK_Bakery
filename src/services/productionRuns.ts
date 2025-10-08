import { api } from '../lib/api';

export interface IngredientDeducted {
  ingredient: string;
  amountDeducted: number;
}

export interface ProductionRun {
  id: string;
  productId: string;
  quantityProduced: number;
  date: string;
  producedBy: string;
  ingredientsDeducted: IngredientDeducted[];
  cost: number;
  notes?: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionRunsResponse {
  productionRuns: ProductionRun[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Get all production runs with optional filters
export const getProductionRuns = async (params?: {
  startDate?: string;
  endDate?: string;
  productName?: string;
  page?: number;
  limit?: number;
}): Promise<ProductionRunsResponse> => {
  const response = await api.get<ProductionRunsResponse>('/production', { params });
  console.log('Production runs response:', response.data);
  return response.data;
};

// Get single production run by ID
export const getProductionRun = async (id: string): Promise<ProductionRun> => {
  const response = await api.get<ProductionRun>(`/production/${id}`);
  return response.data;
};

// Create new production run
export const createProductionRun = async (runData: {
  productId: number;
  quantity: number;
  notes?: string;
}): Promise<ProductionRun> => {
  const response = await api.post<ProductionRun>('/production', runData);
  return response.data;
};

// Update production run
export const updateProductionRun = async (id: string, runData: Partial<ProductionRun>): Promise<ProductionRun> => {
  const response = await api.put<ProductionRun>(`/production/${id}`, runData);
  return response.data;
};

// Delete production run
export const deleteProductionRun = async (id: string): Promise<void> => {
  await api.delete(`/production/${id}`);
};