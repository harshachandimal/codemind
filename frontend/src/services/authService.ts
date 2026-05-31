import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type {
  AuthResponseData,
  CurrentUserResponseData,
  LoginPayload,
  RegisterPayload,
} from '../types/auth';

// Single source of truth for the localStorage key.
// Must match the key read by the apiClient interceptor.
const AUTH_TOKEN_KEY = 'codemind_auth_token';

// ---------------------------------------------------------------------------
// Token storage helpers
// ---------------------------------------------------------------------------

export function storeAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getStoredAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Auth API calls
// ---------------------------------------------------------------------------

export async function registerUser(
  payload: RegisterPayload,
): Promise<ApiResponse<AuthResponseData>> {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>(
    '/auth/register',
    payload,
  );
  if (response.data.data?.token) {
    storeAuthToken(response.data.data.token);
  }
  return response.data;
}

export async function loginUser(
  payload: LoginPayload,
): Promise<ApiResponse<AuthResponseData>> {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>(
    '/auth/login',
    payload,
  );
  if (response.data.data?.token) {
    storeAuthToken(response.data.data.token);
  }
  return response.data;
}

export async function getCurrentUser(): Promise<
  ApiResponse<CurrentUserResponseData>
> {
  const response = await apiClient.get<ApiResponse<CurrentUserResponseData>>(
    '/auth/me',
  );
  return response.data;
}

export async function logoutUser(): Promise<ApiResponse<Record<string, never>>> {
  try {
    const response = await apiClient.post<ApiResponse<Record<string, never>>>(
      '/auth/logout',
    );
    clearAuthToken();
    return response.data;
  } catch (error) {
    // Always clear the local token even when the network request fails,
    // so the frontend does not remain in a partially-authenticated state.
    clearAuthToken();
    throw error;
  }
}
