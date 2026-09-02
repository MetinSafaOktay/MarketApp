'use client';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const TOKEN_KEY = 'marketapp.accessToken';
export const REFRESH_KEY = 'marketapp.refreshToken';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  window.localStorage.setItem(TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_KEY, refreshToken);
  window.dispatchEvent(new Event('marketapp:auth'));
}

export function clearTokens() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.dispatchEvent(new Event('marketapp:auth'));
}

export class ClientApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface Options extends RequestInit {
  locale?: string;
  auth?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

/** İstemci tarafı backend çağrısı. auth:true ise Bearer token ekler. */
export async function clientApi<T>(
  path: string,
  { locale, auth, params, headers, ...init }: Options = {},
): Promise<T> {
  if (!BASE_URL) throw new Error('NEXT_PUBLIC_API_BASE_URL tanımlı değil');

  const url = new URL(path.replace(/^\//, ''), BASE_URL + '/');
  if (locale) url.searchParams.set('lang', locale);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const finalHeaders: Record<string, string> = {
    'content-type': 'application/json',
    ...(headers as Record<string, string>),
  };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders.authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...init, headers: finalHeaders });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message)
        message = Array.isArray(body.message)
          ? body.message.join(', ')
          : body.message;
    } catch {
      /* boş */
    }
    throw new ClientApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
