import type { FastifyInstance } from 'fastify';
import { prisma } from '@outreachos/db';
import { createCampaignSchema, updateCampaignSchema, campaignQuerySchema } from '@outreachos/shared';
import { authenticate, requirePermission, type AuthenticatedRequest } from '../../shared/auth/rbac.guard';
import { AppError } from '../../shared/errors/app-error';

export async function campaignRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  /** GET /campaigns — List campaigns with filters */
  app.get('/', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = campaignQuerySchema.safeParse(req.query);
    if (!parsed.success) throw AppError.badRequest('Invalid query', parsed.error.flatten());
    const { page, pageSize, status, search, sortBy, sortOrder } = parsed.data;

    const where: any = { orgId };
    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.campaign.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { campaignContacts: true, sequenceSteps: true } } },
      }),
      prisma.campaign.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  });

  /** GET /campaigns/:id — Get campaign details */
  app.get<{ Params: { id: string } }>('/:id', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, orgId },
      include: { sequenceSteps: { orderBy: { stepNumber: 'asc' } }, _count: { select: { campaignContacts: true } } },
    });
    if (!campaign) throw AppError.notFound('Campaign not found');
    return campaign;
  });

  /** POST /campaigns — Create campaign */
  app.post('/', { preHandler: [requirePermission('campaigns:create')] }, async (req, reply) => {
    const { orgId, sub } = (req as AuthenticatedRequest).user;
    const parsed = createCampaignSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());

    const campaign = await prisma.campaign.create({
      data: { ...parsed.data, orgId, createdBy: sub },
    });
    reply.status(201).send(campaign);
  });

  /** PATCH /campaigns/:id — Update campaign */
  app.patch<{ Params: { id: string } }>('/:id', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = updateCampaignSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());

    const campaign = await prisma.campaign.findFirst({ where: { id: req.params.id, orgId } });
    if (!campaign) throw AppError.notFound('Campaign not found');

    return prisma.campaign.update({ where: { id: req.params.id }, data: parsed.data });
  });

  /** POST /campaigns/:id/launch — Launch campaign */
  app.post<{ Params: { id: string } }>('/:id/launch', { preHandler: [requirePermission('campaigns:launch')] }, async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, orgId },
      include: { sequenceSteps: true },
    });
    if (!campaign) throw AppError.notFound('Campaign not found');
    if (campaign.status !== 'draft' && campaign.status !== 'paused') {
      throw AppError.badRequest(`Cannot launch campaign in ${campaign.status} status`);
    }
    if (campaign.sequenceSteps.length === 0) {
      throw AppError.badRequest('Campaign must have at least one sequence step');
    }

    // Enroll contacts from the list
    if (campaign.listId) {
      const contacts = await prisma.contact.findMany({
        where: { orgId, listId: campaign.listId, status: 'active' },
        select: { id: true },
      });

      if (contacts.length === 0) {
        throw AppError.badRequest('No active contacts in the selected list');
      }

      await prisma.campaignContact.createMany({
        data: contacts.map(c => ({ campaignId: campaign.id, contactId: c.id })),
        skipDuplicates: true,
      });
    }

    return prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: 'active', launchedAt: new Date() },
    });
  });

  /** POST /campaigns/:id/pause — Pause campaign */
  app.post<{ Params: { id: string } }>('/:id/pause', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    return prisma.campaign.update({
      where: { id: req.params.id, orgId },
      data: { status: 'paused' },
    });
  });

  /** DELETE /campaigns/:id — Delete campaign */
  app.delete<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission('data:delete')] }, async (req, reply) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    await prisma.campaign.delete({ where: { id: req.params.id, orgId } });
    reply.status(204).send();
  });
}
