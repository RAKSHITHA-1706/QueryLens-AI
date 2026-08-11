/**
 * QueryLens AI — API Service
 *
 * Centralised fetch wrapper for all backend communication.
 * Base URL reads from Vite env var; falls back to localhost:8000.
 */

import type { QueryResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export interface HealthResponse {
  status: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

/**
 * Generic fetch helper with error handling.
 */
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw {
      message: errorBody?.message || `HTTP ${response.status}`,
      statusCode: response.status,
      error_type: errorBody?.error_type,
    } as ApiError;
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

/** Call GET /api/health and return the parsed response. */
export async function checkHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/api/health');
}

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

/** Call POST /api/query to process a natural language query */
export async function askQuery(question: string): Promise<QueryResponse> {
  return apiFetch<QueryResponse>('/api/query', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}
