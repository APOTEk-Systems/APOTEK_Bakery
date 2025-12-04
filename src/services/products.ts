import {api} from "../lib/api";

export interface ProductRecipe {
  id?: number;
  productId?: number;
  inventoryItemId: number;
  amountRequired: number;
  unit?: string;
  inventoryItem?: {
    id: number;
    name: string;
    currentQuantity: number;
    unit: string;
    minLevel: number;
    maxLevel: number;
    cost: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdById: number;
    updatedById?: number;
  };
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  prepTime: number | null;
  instructions: string[];
  quantity: number;
  batchSize: number;
  image?: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  createdById: number;
  updatedById: number;
  productRecipes?: {
    id?: number;
    productId?: number;
    inventoryItemId: number;
    amountRequired: number;
    unit?: string;
  }[];
}

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>("/products");
  return response.data;
};

// Get single product by ID
export const getProduct = async (id: number): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

// Create new product
export const createProduct = async (productData: {
  name: string;
  price: number;
  instructions: string[];
  productRecipes: {inventoryItemId: number; amountRequired: number; unit?: string}[];
  description?: string;
  prepTime?: number;
  status?: 'active' | 'inactive';
}): Promise<Product> => {
  const response = await api.post<Product>(
    "/products",
    productData
  );
  return response.data;
};

// Update product
export const updateProduct = async (
  id: number,
  productData: Partial<Product>
): Promise<Product> => {
  const response = await api.put<Product>(
    `/products/${id}`,
    productData
  );
  return response.data;
};

// Delete product
export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export interface ProductAdjustment {
  id: number;
  productId: number;
  amount: number;
  reason: string;
  createdAt: string;
  createdById: number;
  product?: Product;
  createdBy?: {
    id: number;
    name: string;
  };
}

export interface GetProductAdjustmentsParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ProductAdjustmentsResponse {
  adjustments: ProductAdjustment[];
  total: number;
  page: number;
  limit: number;
}

// Get product adjustments
export const getProductAdjustments = async (
  params: GetProductAdjustmentsParams
): Promise<ProductAdjustmentsResponse> => {
  const response = await api.get<ProductAdjustmentsResponse>(
    "/product-adjustments",
    {params}
  );
  return response.data;
};

// Create product adjustment
export const createProductAdjustment = async (data: {
  productId: number;
  amount: number;
  reason: string;
}): Promise<ProductAdjustment> => {
  const response = await api.post<ProductAdjustment>(
    "/product-adjustments",
    data
  );
  return response.data;
};
