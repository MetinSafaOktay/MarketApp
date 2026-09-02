'use client';

import {
  clientApi,
  ClientApiError,
  clearTokens,
  getToken,
  setTokens,
  REFRESH_KEY,
} from './client-api';

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  profile_name: string;
  first_name: string;
  last_name: string;
  profile_photo_url: string | null;
  role: 'customer' | 'admin';
  is_private: boolean;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  profile_name: string;
  first_name: string;
  last_name: string;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await clientApi<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setTokens(res.accessToken, res.refreshToken);
  return res.user;
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const res = await clientApi<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  setTokens(res.accessToken, res.refreshToken);
  return res.user;
}

export async function logout(): Promise<void> {
  const refreshToken =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(REFRESH_KEY)
      : null;
  if (refreshToken) {
    await clientApi('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
  clearTokens();
}

/** Refresh token ile yeni access token alır. Başarısızsa oturumu temizler. */
export async function refreshSession(): Promise<boolean> {
  const refreshToken =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(REFRESH_KEY)
      : null;
  if (!refreshToken) return false;
  try {
    const res = await clientApi<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { method: 'POST', body: JSON.stringify({ refreshToken }) },
    );
    setTokens(res.accessToken, res.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

/** auth:true çağrısı; 401'de bir kez refresh dener. */
export async function authedApi<T>(
  path: string,
  init: Parameters<typeof clientApi>[1] = {},
): Promise<T> {
  try {
    return await clientApi<T>(path, { ...init, auth: true });
  } catch (err) {
    if (err instanceof ClientApiError && err.status === 401 && getToken()) {
      const ok = await refreshSession();
      if (ok) return clientApi<T>(path, { ...init, auth: true });
    }
    throw err;
  }
}

export function fetchMe(): Promise<AuthUser> {
  return authedApi<AuthUser>('/auth/me');
}
