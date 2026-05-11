import type { FastifyInstance } from 'fastify';
import { prisma } from '@outreachos/db';
import { createTemplateSchema, updateTemplateSchema, templateQuerySchema } from '@outreachos/shared';
import { authenticate, type AuthenticatedRequest } from '../../shared/auth/rbac.guard';
import { AppError } from '../../shared/errors/app-error';

export async function templateRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = templateQuerySchema.safeParse(req.query);
    if (!parsed.success) throw AppError.badRequest('Invalid query', parsed.error.flatten());
    const { page, pageSize, category, search, isPublic } = parsed.data;
    const where: any = { OR: [{ orgId }, { isPublic: true }] };
    if (category) where.category = category;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (isPublic !== undefined) where.isPublic = isPublic;

    const [data, total] = await Promise.all([
      prisma.template.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' } }),
      prisma.template.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  });

  app.post('/', async (req, reply) => {
    const { orgId, sub } = (req as AuthenticatedRequest).user;
    const parsed = createTemplateSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());
    const template = await prisma.template.create({ data: { ...parsed.data, orgId, createdBy: sub } });
    reply.status(201).send(template);
  });

  app.patch<{ Params: { id: string } }>('/:id', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = updateTemplateSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());
    return prisma.template.update({ where: { id: req.params.id, orgId }, data: parsed.data });
  });

  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    await prisma.template.delete({ where: { id: req.params.id, orgId } });
    reply.status(204).send();
  });
}
