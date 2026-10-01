export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_MEDIA_API_BASE_URL ?? '/v1';
  const response = await fetch(base + path, { ...options, cache: 'no-store' });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}
