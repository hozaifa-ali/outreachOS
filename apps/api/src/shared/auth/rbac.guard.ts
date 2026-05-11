import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from './jwt.utils';
import { RBAC_PERMISSIONS, type UserRole } from '@outreachos/shared';
import { AppError } from '../errors/app-error';

/** Extended request with authenticated user data */
export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    sub: string;
    orgId: string;
    email: string;
    role: UserRole;
  };
}

/** Middleware: Verifies JWT and injects user into request */
export async function authenticate(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);
  try {
    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).user = {
      sub: payload.sub,
      orgId: payload.orgId,
      email: payload.email,
      role: payload.role as UserRole,
    };
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }
}

/**
 * Factory: Creates an RBAC guard for a specific permission.
 * Must be used after the authenticate middleware.
 */
export function requirePermission(permission: string) {
  return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw AppError.unauthorized();
    }

    const allowedRoles = RBAC_PERMISSIONS[permission];
    if (!allowedRoles || !allowedRoles.includes(user.role)) {
      throw AppError.forbidden(`Insufficient permissions: ${permission} requires one of [${allowedRoles?.join(', ')}]`);
    }
  };
}
