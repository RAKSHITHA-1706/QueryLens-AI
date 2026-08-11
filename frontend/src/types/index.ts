/**
 * Shared TypeScript types for QueryLens AI frontend.
 */

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface HealthCheckState {
  status: Status;
  result: string | null;
  error: string | null;
  latencyMs: number | null;
}

export interface QueryRequest {
  question: string;
}

export interface QueryResponse {
  success: boolean;
  question: string;
  sql?: string;
  explanation?: string;
  columns?: string[];
  rows?: Record<string, any>[];
  row_count?: number;
  truncated?: boolean;
  error_type?: string;
  message?: string;
  status?: string[];
}
