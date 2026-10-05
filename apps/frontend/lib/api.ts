export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_MEDIA_API_BASE_URL ?? '/v1';
  const response = await fetch(base + path, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('AUTH_REQUIRED');
    }
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function sessionFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return api<T>(path, options);
}
