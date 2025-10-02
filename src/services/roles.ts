import { api } from '@/lib/api';

export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: string[];
}

export const rolesService = {
  getAll: async (): Promise<Role[]> => {
    const response = await api.get('/users/roles');
    return response.data;
  },

  getById: async (id: number): Promise<Role> => {
    const response = await api.get(`/users/roles/${id}`);
    return response.data;
  },

  create: async (roleData: CreateRoleData): Promise<Role> => {
    const response = await api.post('/users/roles', roleData);
    return response.data;
  },

  update: async (id: number, roleData: Partial<CreateRoleData>): Promise<Role> => {
    const response = await api.put(`/users/roles/${id}`, roleData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/roles/${id}`);
  },
};