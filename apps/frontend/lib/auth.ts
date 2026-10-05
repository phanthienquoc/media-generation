export type SessionUser = { id?: string; email?: string };

export async function getSession(): Promise<SessionUser | null> {
  const response = await fetch('/v1/session/me', {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return (payload?.user ?? null) as SessionUser | null;
}
