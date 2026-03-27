import type { FarmerRegistration, ApiResponse } from '@shared/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/** In-memory JWT token storage */
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    const res = await fetch(`${API_BASE}${path}`, {
      headers,
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return { success: false, error: err.error || 'Request failed' };
    }
    const data = await res.json();
    return { success: true, data: data.data ?? data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export interface AuthResponse {
  token: string;
  developer: { id: number; companyName: string; contactName: string; email: string };
}

export const api = {
  /** Register a farmer's expression of interest */
  registerFarmer: (farmer: Omit<FarmerRegistration, 'id' | 'createdAt'>) =>
    request<FarmerRegistration>('/farmers', {
      method: 'POST',
      body: JSON.stringify(farmer),
    }),

  /** Get anonymized properties (developer view — locations ±2km offset) */
  getProperties: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request<any[]>(`/properties${params}`);
  },

  /** Health check */
  health: () => request<{ status: string }>('/health'),

  /** Developer authentication */
  auth: {
    register: (data: {
      companyName: string;
      contactName: string;
      email: string;
      phone: string;
      password: string;
      projectTypes: string[];
    }) =>
      request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (email: string, password: string) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    me: () => request<any>('/auth/me'),
  },
};
