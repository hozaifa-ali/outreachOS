import type { FastifyInstance } from 'fastify';
import { prisma } from '@outreachos/db';
import { updateOrganizationSchema, inviteUserSchema, updateUserRoleSchema } from '@outreachos/shared';
import { authenticate, requirePermission, type AuthenticatedRequest } from '../../shared/auth/rbac.guard';
import { AppError } from '../../shared/errors/app-error';
import bcrypt from 'bcrypt';

export async function orgRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  /** GET /organizations/current — Get current org details */
  app.get('/current', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { subscription: true },
    });
    if (!org) throw AppError.notFound('Organization not found');
    return org;
  });

  /** PATCH /organizations/current — Update org settings */
  app.patch('/current', { preHandler: [requirePermission('settings:manage')] }, async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = updateOrganizationSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());

    return prisma.organization.update({ where: { id: orgId }, data: parsed.data });
  });

  /** GET /organizations/team — List team members */
  app.get('/team', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    return prisma.user.findMany({
      where: { orgId },
      select: { id: true, email: true, fullName: true, role: true, avatarUrl: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  });

  /** POST /organizations/team/invite — Invite a new team member */
  app.post('/team/invite', { preHandler: [requirePermission('team:manage')] }, async (req, reply) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = inviteUserSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) throw AppError.conflict('User with this email already exists');

    // Create user with temporary password (they'll need to set it via invite link)
    const tempPassword = await bcrypt.hash(crypto.randomUUID(), 12);
    const user = await prisma.user.create({
      data: {
        orgId,
        email: parsed.data.email,
        fullName: parsed.data.fullName,
        role: parsed.data.role,
        passwordHash: tempPassword,
      },
    });

    reply.status(201).send({ id: user.id, email: user.email, role: user.role });
  });

  /** PATCH /organizations/team/:userId — Update team member role */
  app.patch<{ Params: { userId: string } }>('/team/:userId', { preHandler: [requirePermission('team:manage')] }, async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = updateUserRoleSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());

    return prisma.user.update({
      where: { id: req.params.userId, orgId },
      data: { role: parsed.data.role },
    });
  });

  /** DELETE /organizations/team/:userId — Remove team member */
  app.delete<{ Params: { userId: string } }>('/team/:userId', { preHandler: [requirePermission('team:manage')] }, async (req, reply) => {
    const { orgId, sub } = (req as AuthenticatedRequest).user;
    if (req.params.userId === sub) throw AppError.badRequest('Cannot remove yourself');

    await prisma.user.delete({ where: { id: req.params.userId, orgId } });
    reply.status(204).send();
  });
}
