import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const parseList = (val?: string): string[] => (val || '')
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);

const isIpAllowed = (ip: string, allowlist: string[]): boolean => {
  // Normalize IPv6 localhost
  const normalized = ip === '::1' ? '127.0.0.1' : ip.replace('::ffff:', '');
  return allowlist.length === 0 || allowlist.includes(normalized);
};

export const ipAllowlistForRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'Access token is required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'beamershow-secret-key') as any;
      const userRole = String(decoded.role || '').toUpperCase();

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '';

      if (roles.map((r) => r.toUpperCase()).includes(userRole)) {
        const allowEnv = userRole === 'NOTARY' ? process.env.NOTARY_IP_ALLOWLIST : process.env.AUDITOR_IP_ALLOWLIST;
        const list = parseList(allowEnv);
        if (!isIpAllowed(clientIp, list)) {
          return res.status(403).json({ success: false, message: 'IP not allowed for this role' });
        }
      }

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Unauthorized', error: (error as Error).message });
    }
  };
};



