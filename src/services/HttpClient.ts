const BASE = import.meta.env.VITE_API_URL || 'https://kanji-api-egc8.onrender.com'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly type?: string,
  ) {
    super(message)
  }
}

export interface HttpClient {
  get<T>(path: string, token?: string | null): Promise<T>
  post<T>(path: string, body: unknown, token?: string | null): Promise<T>
}

class FetchHttpClient implements HttpClient {
  get<T>(path: string, token?: string | null): Promise<T> {
    return this.request<T>('GET', path, undefined, token)
  }

  post<T>(path: string, body: unknown, token?: string | null): Promise<T> {
    return this.request<T>('POST', path, body, token)
  }

  private async request<T>(
    method: string,
    path: string,
    body: unknown,
    token?: string | null,
  ): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    const data = res.status === 204 ? null : await res.json().catch(() => null)
    if (!res.ok) {
      const message = data?.message ?? data?.error?.message ?? 'Request failed'
      throw new ApiError(message, res.status, data?.type)
    }
    return data as T
  }
}

export const httpClient: HttpClient = new FetchHttpClient()
