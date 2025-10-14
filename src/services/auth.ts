import { api } from '../lib/api';

// Interfaces based on API docs
export interface User {
  id: number;
  email: string;
  role?: UserRole | string; // Can be role object or role name string
  name?: string;
  status?: string;
  permissions?: string[]; // Permissions can be at user level
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRole{
  id:number;
  name: string;
  description?: string;
  permissions: string[]

}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
}

export interface RefreshResponse {
  user: User;
  token: string;
}

// Get current user
export const getMe = async (): Promise<User> => {
  const response = await api.get<{ user: User }>("/auth/me");
  return response.data.user;
};

// Login function
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  localStorage.setItem("token", response.data.token);
  return response.data;
};

// Register function
export const register = async (
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>("/auth/register", {
    name,
    email,
    password,
  });
  return response.data;
};

// Refresh token function
export const refreshToken = async (): Promise<RefreshResponse> => {
  const response = await api.post<RefreshResponse>("/auth/refresh-token");
  localStorage.setItem("token", response.data.token);
  return response.data;
};

// Logout function
export const logout = () => {
  localStorage.removeItem("token");
  // Optionally call api.post("/auth/logout") to invalidate server-side
};

// Update user profile
export const updateProfile = async (data: { name?: string; currentPassword?: string; newPassword?: string }): Promise<User> => {
  const response = await api.put<{ user: User }>("/auth/me", data);
  return response.data.user;
};

// Get current user (sync, returns null; use getMe for async)
export const getCurrentUser = (): User | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  // For real implementation, decode token or use getMe
  return null;
};

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      originalRequest._retry = true;
      try {
        const { token: newToken } = await refreshToken();
        localStorage.setItem("token", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export { api };
