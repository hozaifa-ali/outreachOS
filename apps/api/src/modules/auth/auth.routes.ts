import type { FastifyInstance } from 'fastify';
import { registerSchema, loginSchema, refreshTokenSchema } from '@outreachos/shared';
import { registerUser, loginUser, refreshAccessToken, revokeRefreshToken } from './auth.service';
import { AppError } from '../../shared/errors/app-error';

/** Auth routes — register, login, refresh, logout, OAuth stubs */
export async function authRoutes(app: FastifyInstance) {
  /** POST /auth/register — Create account + org */
  app.post('/register', async (req, reply) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.badRequest('Validation failed', parsed.error.flatten());
    }
    const result = await registerUser(parsed.data);
    reply.status(201).send(result);
  });

  /** POST /auth/login — Authenticate with email + password */
  app.post('/login', async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.badRequest('Validation failed', parsed.error.flatten());
    }
    const result = await loginUser(parsed.data);
    reply.send(result);
  });

  /** POST /auth/refresh — Get new access token with refresh token */
  app.post('/refresh', async (req, reply) => {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.badRequest('Validation failed', parsed.error.flatten());
    }
    const result = await refreshAccessToken(parsed.data.refreshToken);
    reply.send(result);
  });

  /** POST /auth/logout — Revoke refresh token */
  app.post('/logout', async (req, reply) => {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.badRequest('Validation failed', parsed.error.flatten());
    }
    await revokeRefreshToken(parsed.data.refreshToken);
    reply.send({ message: 'Logged out successfully' });
  });

  /** GET /auth/google — Redirect to Google OAuth */
  app.get('/google', async (req, reply) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      throw AppError.internal('Google OAuth not configured');
    }
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://mail.google.com/',
    ].join(' ');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;
    reply.redirect(url);
  });

  /** GET /auth/google/callback — Handle Google OAuth callback */
  app.get('/google/callback', async (req, reply) => {
    const { code } = req.query as { code?: string };
    if (!code) {
      throw AppError.badRequest('Missing authorization code');
    }
    // TODO: Exchange code for tokens, create/login user
    reply.send({ message: 'Google OAuth callback received', code });
  });

  /** GET /auth/microsoft — Redirect to Microsoft OAuth */
  app.get('/microsoft', async (req, reply) => {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const redirectUri = process.env.MICROSOFT_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      throw AppError.internal('Microsoft OAuth not configured');
    }
    const scopes = 'openid email profile offline_access Mail.ReadWrite Mail.Send';
    const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}`;
    reply.redirect(url);
  });

  /** GET /auth/microsoft/callback — Handle Microsoft OAuth callback */
  app.get('/microsoft/callback', async (req, reply) => {
    const { code } = req.query as { code?: string };
    if (!code) {
      throw AppError.badRequest('Missing authorization code');
    }
    // TODO: Exchange code for tokens, create/login user
    reply.send({ message: 'Microsoft OAuth callback received', code });
  });
}
