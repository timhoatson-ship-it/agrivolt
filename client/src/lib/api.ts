import type { FarmerRegistration, ApiResponse } from '@shared/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
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
};
