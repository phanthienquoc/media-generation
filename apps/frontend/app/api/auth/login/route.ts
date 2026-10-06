import { NextResponse } from 'next/server';

const AUTH_BASE_URL = process.env.AUTH_BASE_URL ?? 'https://auth.mrcute.space';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: 'INVALID_INPUT', message: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${AUTH_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const response = new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
        'cache-control': 'no-store',
      },
    });

    const setCookies =
      typeof upstream.headers.getSetCookie === 'function'
        ? upstream.headers.getSetCookie()
        : [];

    for (const cookie of setCookies) response.headers.append('set-cookie', cookie);

    return response;
  } catch {
    return NextResponse.json(
      { code: 'AUTH_UNAVAILABLE', message: 'Authentication service unavailable' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
}
