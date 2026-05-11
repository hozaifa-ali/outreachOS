import type { FastifyInstance } from 'fastify';
import { prisma } from '@outreachos/db';
import { authenticate, type AuthenticatedRequest } from '../../shared/auth/rbac.guard';
import { AppError } from '../../shared/errors/app-error';

export async function analyticsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  /** GET /analytics/overview — Org-wide analytics summary */
  app.get('/overview', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const [totalContacts, totalCampaigns, totalSent, events] = await Promise.all([
      prisma.contact.count({ where: { orgId } }),
      prisma.campaign.count({ where: { orgId } }),
      prisma.sentEmail.count({ where: { campaign: { orgId } } }),
      prisma.emailEvent.groupBy({ by: ['eventType'], where: { orgId }, _count: true }),
    ]);

    const eventCounts: Record<string, number> = {};
    for (const e of events) { eventCounts[e.eventType] = e._count; }

    return {
      totalContacts, totalCampaigns, totalSent,
      opens: eventCounts['open'] || 0,
      clicks: eventCounts['click'] || 0,
      replies: eventCounts['reply'] || 0,
      bounces: eventCounts['bounce'] || 0,
      unsubscribes: eventCounts['unsubscribe'] || 0,
      openRate: totalSent ? ((eventCounts['open'] || 0) / totalSent * 100).toFixed(1) : '0',
      replyRate: totalSent ? ((eventCounts['reply'] || 0) / totalSent * 100).toFixed(1) : '0',
    };
  });

  /** GET /analytics/campaigns/:id — Campaign-specific analytics */
  app.get<{ Params: { id: string } }>('/campaigns/:id', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const campaign = await prisma.campaign.findFirst({ where: { id: req.params.id, orgId } });
    if (!campaign) throw AppError.notFound('Campaign not found');

    const [totalEnrolled, sent, events, stepStats] = await Promise.all([
      prisma.campaignContact.count({ where: { campaignId: campaign.id } }),
      prisma.sentEmail.count({ where: { campaignId: campaign.id } }),
      prisma.emailEvent.groupBy({ by: ['eventType'], where: { campaignId: campaign.id }, _count: true }),
      prisma.sentEmail.groupBy({
        by: ['stepId'],
        where: { campaignId: campaign.id },
        _count: true,
      }),
    ]);

    const eventCounts: Record<string, number> = {};
    for (const e of events) { eventCounts[e.eventType] = e._count; }

    return {
      campaignId: campaign.id, campaignName: campaign.name,
      totalEnrolled, totalSent: sent,
      opens: eventCounts['open'] || 0,
      clicks: eventCounts['click'] || 0,
      replies: eventCounts['reply'] || 0,
      bounces: eventCounts['bounce'] || 0,
      unsubscribes: eventCounts['unsubscribe'] || 0,
      stepStats,
    };
  });

  /** GET /analytics/mailbox-health — Mailbox reputation overview */
  app.get('/mailbox-health', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const mailboxes = await prisma.mailbox.findMany({
      where: { orgId },
      select: { id: true, email: true, reputation: true, sentToday: true, dailyLimit: true, status: true, warmupEnabled: true },
    });
    return mailboxes;
  });
}
