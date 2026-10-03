import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryOne } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'student_growth_foundation_secret_2026';

export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  role: 'admin' | 'teacher' | 'student';
  subject?: string | null;
  is_active: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      role: user.role,
      subject: user.subject,
      is_active: user.is_active
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      res.status(403).json({ error: 'Invalid or expired session. Please sign in again.' });
      return;
    }
    const user = decoded as AuthUser;
    // Verify live account status in database to immediately enforce admin disable/delete
    const liveUser = queryOne('SELECT is_active, role FROM users WHERE id = ?', [user.id]);
    if (!liveUser || liveUser.is_active === 0) {
      res.status(403).json({ error: 'This account has been disabled by an administrator.' });
      return;
    }
    user.role = liveUser.role;
    user.is_active = liveUser.is_active;
    req.user = user;
    next();
  });
}

export function requireRole(...allowedRoles: Array<'admin' | 'teacher' | 'student'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Requires role: [${allowedRoles.join(' or ')}]. Your current role is '${req.user.role}'.`
      });
      return;
    }

    next();
  };
}
