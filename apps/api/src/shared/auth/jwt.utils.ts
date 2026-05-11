import jwt from 'jsonwebtoken';
import type { JwtPayload } from '@outreachos/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me';

/** Generates a short-lived access token (15 minutes) */
export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

/** Generates a long-lived refresh token (30 days) */
export function generateRefreshToken(payload: Pick<JwtPayload, 'sub'>): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

/** Verifies an access token and returns the payload */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

/** Verifies a refresh token and returns the payload */
export function verifyRefreshToken(token: string): Pick<JwtPayload, 'sub'> {
  return jwt.verify(token, JWT_REFRESH_SECRET) as Pick<JwtPayload, 'sub'>;
}
