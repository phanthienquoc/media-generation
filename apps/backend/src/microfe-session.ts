import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class MicrofeSession {
  async require(request: { headers: Record<string, string | string[] | undefined> }) {
    const authServiceUrl = process.env.AUTH_SERVICE_URL;
    if (!authServiceUrl) {
      throw new UnauthorizedException('AUTH_SERVICE_UNAVAILABLE');
    }

    const cookie = request.headers.cookie;
    if (!cookie) {
      throw new UnauthorizedException('AUTH_REQUIRED');
    }

    const response = await fetch(new URL('/auth/me', authServiceUrl), {
      headers: { cookie: Array.isArray(cookie) ? cookie.join('; ') : cookie },
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) {
      throw new UnauthorizedException('AUTH_REQUIRED');
    }

    return response.json() as Promise<{ user: unknown }>;
  }
}
