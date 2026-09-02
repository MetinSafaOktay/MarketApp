const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiOptions extends RequestInit {
  /** ?lang= olarak eklenir; çevrilebilir alanları bu dile çözer. */
  locale?: string;
  /** saniye; server component fetch cache'i için (varsayılan 60). */
  revalidate?: number | false;
  /** query string parametreleri */
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiFetch<T>(
  path: string,
  { locale, revalidate = 60, params, headers, ...init }: ApiOptions = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL tanımlı değil');
  }

  const url = new URL(path.replace(/^\//, ''), BASE_URL + '/');
  if (locale) url.searchParams.set('lang', locale);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url, {
    ...init,
    headers: { 'content-type': 'application/json', ...headers },
    next: revalidate === false ? undefined : { revalidate },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) {
        message = Array.isArray(body.message)
          ? body.message.join(', ')
          : body.message;
      }
    } catch {
      /* yanıt gövdesi JSON değil */
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}
