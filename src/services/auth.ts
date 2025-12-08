// services/auth.ts
import { api } from '../lib/api'; // your axios instance
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders } from 'axios';

/**
 * Types
 */
export interface User {
  id: number;
  email: string;
  role: string | { id: number; name: string };
  name: string;
  phoneNumber?: string;
  status?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
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
  user?: User;
  token: string;
}

/**
 * In-memory token + user storage (NOT localStorage)
 */
let accessToken: string | null = null;
let currentUser: User | null = null;

export const getAccessToken = () => accessToken;
export const getUser = () => currentUser;

/**
 * Set access token in memory and optionally set user
 */
const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const setUser = (user: User | null) => {
  currentUser = user;
};

/**
 * Ensure axios will include cookies for refresh-token requests
 * (httpOnly refresh token stored in cookie on backend)
 */
api.defaults.withCredentials = true;

/**
 * Login, Register, Logout, GetMe, Update
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  const { token, user } = response.data;
  setAccessToken(token);
  setUser(user);
  return response.data;
};

export const register = async (name: string, email: string, password: string): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', { name, email, password });
  return response.data;
};

export const logout = async (): Promise<void> => {
  // Clear client-side state
  setAccessToken(null);
  setUser(null);

  // Tell backend to clear cookie/session (best-effort)
  try {
    await api.post('/auth/logout');
  } catch (err) {
    // ignore network errors on logout
  }

  // Optionally navigate to login page in your app code
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<{ user: User }>('/auth/me');
  setUser(response.data.user);
  return response.data.user;
};

export const updateProfile = async (data: { name?: string; currentPassword?: string; newPassword?: string }): Promise<User> => {
  const response = await api.put<{ user: User }>('/auth/me', data);
  setUser(response.data.user);
  return response.data.user;
};

/**
 * Refresh token flow
 * Backend: expects cookie with refresh token and returns { token, user? }
 */
export const refreshToken = async (): Promise<RefreshResponse> => {
  const response = await api.post<RefreshResponse>('/auth/refresh-token');
  const { token, user } = response.data;
  setAccessToken(token);
  if (user) setUser(user);
  return response.data;
};

/**
 * getCurrentUser (sync) — returns the in-memory user (null if not loaded)
 * If you need to persist across reloads, call getMe() on app start (silent auth)
 */
export const getCurrentUser = (): User | null => {
  return currentUser;
};

/**
 * Axios interceptors: attach token and handle 401 -> refresh
 *
 * This implementation includes:
 * - Request interceptor adding Authorization header if accessToken exists
 * - Response interceptor that performs a single refresh when many requests fail
 *   (using a queue to avoid multiple concurrent refresh calls)
 */

/* --- Request interceptor --- */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig<any>) => {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* --- Response interceptor with refresh queue/lock --- */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  originalRequest: InternalAxiosRequestConfig<any>;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, originalRequest }) => {
    if (error) {
      reject(error);
    } else {
      if (!originalRequest.headers) {
        originalRequest.headers = new AxiosHeaders();
      }
      if (token) {
        originalRequest.headers.set('Authorization', `Bearer ${token}`);
      }
      resolve(api(originalRequest));
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig<any> & { _retry?: boolean };

    // If there's no response, forward error
    if (!error.response) {
      return Promise.reject(error);
    }

    // Prevent infinite loop for refresh endpoint itself
    if (originalRequest && originalRequest.url && originalRequest.url.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      // Mark request to avoid retry loop
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue the request until the refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, originalRequest });
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await refreshToken();
        const newToken = refreshResponse.token;

        processQueue(null, newToken);
        isRefreshing = false;

        // Set header for original request and retry
        if (!originalRequest.headers) {
          originalRequest.headers = new AxiosHeaders();
        }
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear local auth state and redirect to login if needed
        setAccessToken(null);
        setUser(null);

        // Optionally navigate to login page from here or let the app handle it
        // window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Optional: initializeAuth
 * If your app wants to attempt a silent refresh on app start (to restore session after reload),
 * call initializeAuth() at boot (e.g. in App.tsx useEffect).
 *
 * It will:
 *  - call /auth/refresh-token (cookie is sent automatically because withCredentials = true)
 *  - set access token + user in memory if successful
 *  - otherwise do nothing (user stays unauthenticated)
 */
export const initializeAuth = async (): Promise<void> => {
  try {
    const res = await refreshToken();
    // token and user have been set inside refreshToken()
  } catch (err) {
    // No valid session; do nothing. App can redirect to login if desired.
  }
};

export { api };
