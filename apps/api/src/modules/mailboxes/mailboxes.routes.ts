import type { FastifyInstance } from 'fastify';
import { prisma } from '@outreachos/db';
import { connectSmtpSchema, updateMailboxSchema } from '@outreachos/shared';
import { encrypt } from '@outreachos/shared';
import { authenticate, requirePermission, type AuthenticatedRequest } from '../../shared/auth/rbac.guard';
import { AppError } from '../../shared/errors/app-error';

const ENC_KEY = process.env.ENCRYPTION_MASTER_KEY || 'dev-key-change-me-32bytes-long!!';

export async function mailboxRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requirePermission('mailboxes:manage'));

  app.get('/', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const mailboxes = await prisma.mailbox.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
    return mailboxes.map(m => ({ ...m, credentials: undefined }));
  });

  app.post('/connect/smtp', async (req, reply) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = connectSmtpSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());
    const enc = encrypt(JSON.stringify({ host: parsed.data.smtpHost, port: parsed.data.smtpPort, user: parsed.data.smtpUser, pass: parsed.data.smtpPass, useTls: parsed.data.useTls }), ENC_KEY);
    const mailbox = await prisma.mailbox.create({ data: { orgId, email: parsed.data.email, provider: 'smtp', credentials: { encrypted: enc }, dailyLimit: 50 } });
    reply.status(201).send({ ...mailbox, credentials: undefined });
  });

  app.post('/connect/gmail', async (req, reply) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const { code } = req.body as { code: string };
    if (!code) throw AppError.badRequest('Missing OAuth code');
    const enc = encrypt(JSON.stringify({ type: 'oauth2', code }), ENC_KEY);
    const mailbox = await prisma.mailbox.create({ data: { orgId, email: 'pending-oauth@gmail.com', provider: 'gmail', credentials: { encrypted: enc } } });
    reply.status(201).send({ ...mailbox, credentials: undefined });
  });

  app.post('/connect/outlook', async (req, reply) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const { code } = req.body as { code: string };
    if (!code) throw AppError.badRequest('Missing OAuth code');
    const enc = encrypt(JSON.stringify({ type: 'oauth2', code }), ENC_KEY);
    const mailbox = await prisma.mailbox.create({ data: { orgId, email: 'pending-oauth@outlook.com', provider: 'outlook', credentials: { encrypted: enc } } });
    reply.status(201).send({ ...mailbox, credentials: undefined });
  });

  app.patch<{ Params: { id: string } }>('/:id', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = updateMailboxSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());
    return prisma.mailbox.update({ where: { id: req.params.id, orgId }, data: parsed.data });
  });

  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    await prisma.mailbox.delete({ where: { id: req.params.id, orgId } });
    reply.status(204).send();
  });
}
