import type { FastifyInstance } from 'fastify';
import { prisma } from '@outreachos/db';
import { createCheckoutSchema } from '@outreachos/shared';
import { PLAN_LIMITS } from '@outreachos/shared';
import { authenticate, requirePermission, type AuthenticatedRequest } from '../../shared/auth/rbac.guard';
import { AppError } from '../../shared/errors/app-error';

export async function billingRoutes(app: FastifyInstance) {
  /** GET /billing/subscription — Get current subscription */
  app.get('/subscription', { preHandler: [authenticate] }, async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const sub = await prisma.subscription.findUnique({ where: { orgId } });
    if (!sub) throw AppError.notFound('No subscription found');
    return sub;
  });

  /** GET /billing/plans — List available plans */
  app.get('/plans', async () => {
    return Object.entries(PLAN_LIMITS).map(([key, val]) => ({ id: key, ...val }));
  });

  /** POST /billing/checkout — Create Stripe checkout session */
  app.post('/checkout', { preHandler: [authenticate, requirePermission('billing:manage')] }, async (req, reply) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = createCheckoutSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());

    // Stripe integration placeholder — requires STRIPE_SECRET_KEY
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw AppError.internal('Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.');
    }

    // In production: create Stripe Checkout Session
    reply.send({
      message: 'Stripe checkout session would be created here',
      plan: parsed.data.plan,
      orgId,
    });
  });

  /** POST /billing/webhook — Stripe webhook handler */
  app.post('/webhook', async (req, reply) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw AppError.internal('Stripe webhook secret not configured');
    }

    // In production: verify signature and process events
    const event = req.body as any;
    const eventType = event?.type;

    switch (eventType) {
      case 'checkout.session.completed':
        // Create/update subscription
        break;
      case 'invoice.paid':
        // Mark subscription active
        break;
      case 'invoice.payment_failed':
        // Mark subscription past_due
        break;
      case 'customer.subscription.updated':
        // Sync plan changes
        break;
      case 'customer.subscription.deleted':
        // Mark subscription canceled
        break;
    }

    reply.status(200).send({ received: true });
  });

  /** GET /billing/usage — Get current usage stats */
  app.get('/usage', { preHandler: [authenticate] }, async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    const sub = await prisma.subscription.findUnique({ where: { orgId } });
    const sentThisMonth = await prisma.sentEmail.count({
      where: {
        campaign: { orgId },
        sentAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    });
    const teamSize = await prisma.user.count({ where: { orgId } });
    const mailboxCount = await prisma.mailbox.count({ where: { orgId } });
    const campaignCount = await prisma.campaign.count({ where: { orgId, status: { not: 'archived' } } });

    return {
      plan: org?.plan,
      emailsSent: sentThisMonth,
      emailQuota: sub?.emailQuota,
      seats: teamSize,
      seatsQuota: sub?.seatsQuota,
      mailboxes: mailboxCount,
      campaigns: campaignCount,
    };
  });
}
