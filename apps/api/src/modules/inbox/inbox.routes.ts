import type { FastifyInstance } from 'fastify';
import { prisma } from '@outreachos/db';
import { inboxQuerySchema, updateThreadSchema, sendReplySchema } from '@outreachos/shared';
import { authenticate, type AuthenticatedRequest } from '../../shared/auth/rbac.guard';
import { AppError } from '../../shared/errors/app-error';

export async function inboxRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/threads', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = inboxQuerySchema.safeParse(req.query);
    if (!parsed.success) throw AppError.badRequest('Invalid query', parsed.error.flatten());
    const { page, pageSize, status, label, channel, assignedTo, campaignId, search, sortBy, sortOrder } = parsed.data;

    const where: any = { orgId };
    if (status) where.status = status;
    if (label) where.label = label;
    if (channel) where.channel = channel;
    if (assignedTo) where.assignedTo = assignedTo;
    if (campaignId) where.campaignId = campaignId;

    const [data, total] = await Promise.all([
      prisma.inboxThread.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: { contact: { select: { email: true, firstName: true, lastName: true, company: true } }, messages: { take: 1, orderBy: { sentAt: 'desc' } } },
      }),
      prisma.inboxThread.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  });

  app.get<{ Params: { id: string } }>('/threads/:id', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const thread = await prisma.inboxThread.findFirst({
      where: { id: req.params.id, orgId },
      include: { contact: true, messages: { orderBy: { sentAt: 'asc' } }, campaign: { select: { name: true } } },
    });
    if (!thread) throw AppError.notFound('Thread not found');
    return thread;
  });

  app.patch<{ Params: { id: string } }>('/threads/:id', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = updateThreadSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());
    return prisma.inboxThread.update({ where: { id: req.params.id, orgId }, data: parsed.data });
  });

  app.post<{ Params: { id: string } }>('/threads/:id/reply', async (req, reply) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = sendReplySchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());

    const thread = await prisma.inboxThread.findFirst({ where: { id: req.params.id, orgId } });
    if (!thread) throw AppError.notFound('Thread not found');

    const message = await prisma.threadMessage.create({
      data: { threadId: thread.id, direction: 'outbound', body: parsed.data.body, htmlBody: parsed.data.htmlBody },
    });
    await prisma.inboxThread.update({ where: { id: thread.id }, data: { lastMessageAt: new Date() } });
    reply.status(201).send(message);
  });
}
