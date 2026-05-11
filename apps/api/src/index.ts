import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { authRoutes } from './modules/auth/auth.routes';
import { orgRoutes } from './modules/organizations/org.routes';
import { contactRoutes } from './modules/contacts/contacts.routes';
import { campaignRoutes } from './modules/campaigns/campaigns.routes';
import { sequenceRoutes } from './modules/sequences/sequences.routes';
import { mailboxRoutes } from './modules/mailboxes/mailboxes.routes';
import { inboxRoutes } from './modules/inbox/inbox.routes';
import { templateRoutes } from './modules/templates/templates.routes';
import { trackingRoutes } from './modules/tracking/tracking.routes';
import { webhookRoutes } from './modules/webhooks/inbound.routes';
import { billingRoutes } from './modules/billing/billing.routes';
import { analyticsRoutes } from './modules/analytics/analytics.routes';
import { errorHandler } from './shared/errors/app-error';

const PORT = Number(process.env.API_PORT) || 3001;
const HOST = '0.0.0.0';

async function buildServer() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
    },
  });

  // ─── Global Plugins ─────────────────────────────────────
  await app.register(cors, {
    origin: process.env.APP_URL || 'http://localhost:3000',
    credentials: true,
  });

  await app.register(cookie, { secret: process.env.JWT_SECRET || 'dev-secret' });

  await app.register(rateLimit, {
    max: 1000,
    timeWindow: '15 minutes',
    keyGenerator: (req) => {
      // Rate limit by org_id if authenticated, otherwise by IP
      const orgId = (req as any).user?.orgId;
      return orgId || req.ip;
    },
  });

  await app.register(multipart, {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'OutreachOS API',
        description: 'AI-Powered Cold Email & Multi-Channel Outreach Platform',
        version: '0.1.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
  });

  await app.register(swaggerUi, { routePrefix: '/docs' });

  // ─── Error Handler ──────────────────────────────────────
  app.setErrorHandler(errorHandler);

  // ─── Routes ─────────────────────────────────────────────
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(orgRoutes, { prefix: '/organizations' });
  await app.register(contactRoutes, { prefix: '/contacts' });
  await app.register(campaignRoutes, { prefix: '/campaigns' });
  await app.register(sequenceRoutes, { prefix: '/sequences' });
  await app.register(mailboxRoutes, { prefix: '/mailboxes' });
  await app.register(inboxRoutes, { prefix: '/inbox' });
  await app.register(templateRoutes, { prefix: '/templates' });
  await app.register(trackingRoutes, { prefix: '/t' });
  await app.register(webhookRoutes, { prefix: '/webhooks' });
  await app.register(billingRoutes, { prefix: '/billing' });
  await app.register(analyticsRoutes, { prefix: '/analytics' });

  // ─── Health Check ───────────────────────────────────────
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
}

buildServer()
  .then((app) => app.listen({ port: PORT, host: HOST }))
  .then((address) => console.log(`🚀 OutreachOS API running at ${address}`))
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
