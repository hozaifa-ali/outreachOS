import type { FastifyInstance } from 'fastify';
import { prisma } from '@outreachos/db';

/** Open/click tracking endpoints — no auth required (called from emails) */
export async function trackingRoutes(app: FastifyInstance) {
  /** GET /t/open/:trackingId — 1x1 tracking pixel for open detection */
  app.get<{ Params: { trackingId: string } }>('/open/:trackingId', async (req, reply) => {
    const { trackingId } = req.params;

    // Record open event asynchronously
    prisma.emailEvent.create({
      data: {
        sentId: trackingId,
        eventType: 'open',
        metadata: { ip: req.ip, userAgent: req.headers['user-agent'] },
      },
    }).catch(err => req.log.error(err, 'Failed to record open event'));

    // Return transparent 1x1 GIF
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    reply.header('Content-Type', 'image/gif').header('Cache-Control', 'no-store, no-cache').send(pixel);
  });

  /** GET /t/click/:trackingId — Link click tracking with redirect */
  app.get<{ Params: { trackingId: string }; Querystring: { url: string } }>('/click/:trackingId', async (req, reply) => {
    const { trackingId } = req.params;
    const { url } = req.query;

    if (!url) {
      reply.status(400).send({ error: 'Missing redirect URL' });
      return;
    }

    // Record click event asynchronously
    prisma.emailEvent.create({
      data: {
        sentId: trackingId,
        eventType: 'click',
        metadata: { url, ip: req.ip, userAgent: req.headers['user-agent'] },
      },
    }).catch(err => req.log.error(err, 'Failed to record click event'));

    reply.status(302).redirect(url as string);
  });

  /** GET /t/unsubscribe/:trackingId — One-click unsubscribe */
  app.get<{ Params: { trackingId: string } }>('/unsubscribe/:trackingId', async (req, reply) => {
    const { trackingId } = req.params;

    try {
      const sentEmail = await prisma.sentEmail.findUnique({
        where: { id: trackingId },
        include: { campaignContact: true },
      });

      if (sentEmail?.campaignContact) {
        await prisma.$transaction([
          prisma.campaignContact.update({
            where: { id: sentEmail.campaignContact.id },
            data: { status: 'unsubscribed' },
          }),
          prisma.contact.update({
            where: { id: sentEmail.campaignContact.contactId },
            data: { status: 'unsubscribed' },
          }),
          prisma.emailEvent.create({
            data: { sentId: trackingId, eventType: 'unsubscribe', contactId: sentEmail.campaignContact.contactId },
          }),
        ]);
      }
    } catch (err) {
      req.log.error(err, 'Failed to process unsubscribe');
    }

    reply.type('text/html').send('<html><body><h1>You have been unsubscribed</h1><p>You will no longer receive emails from this campaign.</p></body></html>');
  });
}
