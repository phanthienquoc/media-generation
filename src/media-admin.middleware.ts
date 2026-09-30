import { Injectable, NestMiddleware } from '@nestjs/common';
@Injectable()
export class MediaAdminMiddleware implements NestMiddleware {
  use(req: any, res: any, next: any) {
    if (req.path === '/v1/health' || req.path === '/v1/ready') return next();
    const user = process.env.MEDIA_ADMIN_USERNAME;
    const pass = process.env.MEDIA_ADMIN_PASSWORD;
    if (!user || !pass) return res.status(503).send('Media admin credentials are not configured');
    const header = req.headers.authorization ?? '';
    if (!header.startsWith('Basic ')) { res.setHeader('WWW-Authenticate','Basic realm="media.mrcute.space"'); return res.status(401).send('Authentication required'); }
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const split = decoded.indexOf(':');
    if (split < 0 || decoded.slice(0,split)!==user || decoded.slice(split+1)!==pass) return res.status(401).send('Invalid credentials');
    next();
  }
}
