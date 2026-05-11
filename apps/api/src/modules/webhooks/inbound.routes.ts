import type { FastifyInstance } from 'fastify';
import { prisma } from '@outreachos/db';
import { AppError } from '../../shared/errors/app-error';

/** Inbound email parser webhook + outbound webhook stubs */
export async function webhookRoutes(app: FastifyInstance) {
  /** POST /webhooks/inbound-email — Parse inbound email replies */
  app.post('/inbound-email', async (req, reply) => {
    const body = req.body as any;

    // Extract fields from webhook payload (Mailgun/SendGrid format)
    const fromEmail = body.from || body.sender;
    const toEmail = body.to || body.recipient;
    const subject = body.subject || '';
    const textBody = body['body-plain'] || body.text || body.body || '';
    const htmlBody = body['body-html'] || body.html || '';
    const messageId = body['Message-Id'] || body.messageId || '';
    const inReplyTo = body['In-Reply-To'] || body.inReplyTo || '';

    if (!fromEmail) {
      throw AppError.badRequest('Missing sender email');
    }

    // Match to sent email via In-Reply-To or Message-ID header
    let sentEmail = null;
    if (inReplyTo) {
      sentEmail = await prisma.sentEmail.findFirst({ where: { messageId: inReplyTo } });
    }

    let thread;
    if (sentEmail) {
      // Find existing thread or create new one
      thread = await prisma.inboxThread.findFirst({
        where: { campaignId: sentEmail.campaignId || undefined },
      });

      if (!thread && sentEmail.campaignId) {
        const campaign = await prisma.campaign.findUnique({ where: { id: sentEmail.campaignId } });
        thread = await prisma.inboxThread.create({
          data: {
            orgId: campaign?.orgId || '',
            campaignId: sentEmail.campaignId,
            contactId: sentEmail.campaignContactId ? undefined : undefined,
            channel: 'email',
            lastMessageAt: new Date(),
          },
        });
      }

      // Update campaign contact status to replied
      if (sentEmail.campaignContactId) {
        await prisma.campaignContact.update({
          where: { id: sentEmail.campaignContactId },
          data: { status: 'replied' },
        }).catch(() => {}); // Non-critical

        // Record reply event
        await prisma.emailEvent.create({
          data: {
            sentId: sentEmail.id,
            campaignId: sentEmail.campaignId || undefined,
            eventType: 'reply',
          },
        }).catch(() => {});
      }
    }

    // Create thread message
    if (thread) {
      await prisma.threadMessage.create({
        data: {
          threadId: thread.id,
          direction: 'inbound',
          body: textBody,
          htmlBody: htmlBody || undefined,
          fromEmail,
          toEmail,
        },
      });
      await prisma.inboxThread.update({
        where: { id: thread.id },
        data: { lastMessageAt: new Date(), status: 'open' },
      });
    }

    reply.status(200).send({ received: true, threadId: thread?.id });
  });

  /** POST /webhooks/email-events — Bounce/delivery webhook handler */
  app.post('/email-events', async (req, reply) => {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const event of events as any[]) {
      const eventType = event.event || event.type;
      const messageId = event.messageId || event['Message-Id'];

      if (messageId && eventType) {
        const sentEmail = await prisma.sentEmail.findFirst({ where: { messageId } });
        if (sentEmail) {
          await prisma.emailEvent.create({
            data: {
              sentId: sentEmail.id,
              campaignId: sentEmail.campaignId || undefined,
              eventType: eventType === 'bounced' ? 'bounce' : eventType,
            },
          });

          // Handle bounces
          if (eventType === 'bounced' || eventType === 'bounce') {
            await prisma.sentEmail.update({ where: { id: sentEmail.id }, data: { status: 'bounced' } });
            if (sentEmail.campaignContactId) {
              await prisma.campaignContact.update({
                where: { id: sentEmail.campaignContactId },
                data: { status: 'bounced' },
              }).catch(() => {});
            }
          }
        }
      }
    }
    reply.status(200).send({ processed: events.length });
  });
}
