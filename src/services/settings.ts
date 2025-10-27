import { api } from '@/lib/api';

export interface BusinessHour {
  day: string;
  open: string | null;
  close: string | null;
  isOpen: boolean;
}

export interface AdjustmentReason {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsData {
  information: {
    email: string;
    phone: string;
    address: string;
    website: string;
    bakeryName: string;
    description: string;
    tin: string;
    registrationNumber: string;
    vrnNumber: string;
    slogan: string;
    logo: string;
    vatPercentage: string;
  };
  configuration?: {
    vat: number;
    receiptSize: string;
    printReceipt: boolean;
    allowCreditSales: boolean;
  };
  businessHours: {data:BusinessHour[]};
  notifications: {
    dailySalesSummary: boolean;
    lowInventoryAlerts: boolean;
    newOrderNotifications: boolean;
    outOfStockAlerts: boolean;
    customerBirthdayReminders: boolean;
  };
  vatAndTax: {
    taxRate: number;
    acceptCash: boolean;
    acceptCards: boolean;
  };
}

export interface UpdateSettingsRequest {
  key: 'information' | 'configuration' | 'businessHours' | 'notifications' | 'vatAndTax';
  data?: BusinessHour[];
  [key: string]: any;
}

export const settingsService = {
  getAll: async (): Promise<SettingsData> => {
    const response = await api.get('/settings');
    return response.data.data;
  },

  update: async (data: UpdateSettingsRequest): Promise<any> => {
    const response = await api.put('/settings', data);
    return response.data.data;
  },

  // Adjustment Reasons
  getAdjustmentReasons: async (): Promise<AdjustmentReason[]> => {
    const response = await api.get('/settings/reasons');
    return response.data;
  },

  createAdjustmentReason: async (data: { name: string; description: string }): Promise<AdjustmentReason> => {
    const response = await api.post('/settings/reasons', data);
    return response.data;
  },

  updateAdjustmentReason: async (id: number, data: { name?: string; description?: string }): Promise<AdjustmentReason> => {
    const response = await api.patch(`/settings/reasons/${id}`, data);
    return response.data;
  },

  deleteAdjustmentReason: async (id: number): Promise<void> => {
    await api.delete(`/settings/reasons/${id}`);
  },
};