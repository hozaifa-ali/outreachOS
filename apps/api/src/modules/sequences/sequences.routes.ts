import type { FastifyInstance } from 'fastify';
import { prisma } from '@outreachos/db';
import { createSequenceStepSchema, updateSequenceStepSchema, reorderStepsSchema } from '@outreachos/shared';
import { authenticate, type AuthenticatedRequest } from '../../shared/auth/rbac.guard';
import { AppError } from '../../shared/errors/app-error';

export async function sequenceRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  /** GET /sequences/:campaignId — Get all steps for a campaign */
  app.get<{ Params: { campaignId: string } }>('/:campaignId', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const campaign = await prisma.campaign.findFirst({ where: { id: req.params.campaignId, orgId } });
    if (!campaign) throw AppError.notFound('Campaign not found');

    return prisma.sequenceStep.findMany({
      where: { campaignId: req.params.campaignId },
      orderBy: { stepNumber: 'asc' },
    });
  });

  /** POST /sequences — Create a sequence step */
  app.post('/', async (req, reply) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = createSequenceStepSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());

    // Verify campaign belongs to org
    const campaign = await prisma.campaign.findFirst({ where: { id: parsed.data.campaignId, orgId } });
    if (!campaign) throw AppError.notFound('Campaign not found');

    const step = await prisma.sequenceStep.create({ data: parsed.data });
    reply.status(201).send(step);
  });

  /** PATCH /sequences/:id — Update a step */
  app.patch<{ Params: { id: string } }>('/:id', async (req) => {
    const parsed = updateSequenceStepSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());

    return prisma.sequenceStep.update({ where: { id: req.params.id }, data: parsed.data });
  });

  /** DELETE /sequences/:id — Delete a step */
  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    await prisma.sequenceStep.delete({ where: { id: req.params.id } });
    reply.status(204).send();
  });

  /** PUT /sequences/reorder — Reorder steps */
  app.put('/reorder', async (req) => {
    const parsed = reorderStepsSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());

    await prisma.$transaction(
      parsed.data.steps.map(s =>
        prisma.sequenceStep.update({ where: { id: s.id }, data: { stepNumber: s.stepNumber } })
      )
    );
    return { message: 'Steps reordered' };
  });
}
