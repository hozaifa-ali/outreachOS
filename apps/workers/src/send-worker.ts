import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@outreachos/db';
import { renderTemplate } from '@outreachos/shared';
import { createTransport } from 'nodemailer';
import { decrypt } from '@outreachos/shared';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
const ENC_KEY = process.env.ENCRYPTION_MASTER_KEY || 'dev-key-change-me-32bytes-long!!';
const API_URL = process.env.API_URL || 'http://localhost:3001';

export const sendQueue = new Queue('email.send', { connection });

export const sendWorker = new Worker('email.send', async (job) => {
  const { campaignContactId, stepId } = job.data;

  // 1. Load campaign contact + step
  const cc = await prisma.campaignContact.findUnique({
    where: { id: campaignContactId },
    include: { contact: true, campaign: { include: { sequenceSteps: true } } },
  });
  if (!cc) throw new Error(`CampaignContact ${campaignContactId} not found`);

  // 2. Check contact status
  if (['unsubscribed', 'bounced', 'failed'].includes(cc.status)) {
    console.log(`Skipping ${cc.contact.email}: status=${cc.status}`);
    return { skipped: true, reason: cc.status };
  }

  const step = cc.campaign.sequenceSteps.find(s => s.id === stepId);
  if (!step) throw new Error(`Step ${stepId} not found`);

  // 3. Render template
  const variables: Record<string, string | undefined> = {
    first_name: cc.contact.firstName || '',
    last_name: cc.contact.lastName || '',
    company: cc.contact.company || '',
    title: cc.contact.title || '',
    email: cc.contact.email,
    industry: cc.contact.industry || '',
  };

  const subject = renderTemplate(step.subject || '', variables);
  const body = renderTemplate(step.body || '', variables);

  // 4. Select mailbox (least-used with available capacity)
  const mailboxes = await prisma.mailbox.findMany({
    where: { orgId: cc.campaign.orgId, status: 'active' },
    orderBy: { sentToday: 'asc' },
  });

  const mailbox = mailboxes.find(m => m.sentToday < m.dailyLimit && m.reputation > 60);
  if (!mailbox) {
    // Requeue for later
    await sendQueue.add('email.send', job.data, { delay: 60 * 60 * 1000 });
    return { requeued: true, reason: 'No available mailboxes' };
  }

  // 5. Decrypt credentials
  let creds: any = {};
  if (mailbox.credentials && (mailbox.credentials as any).encrypted) {
    creds = JSON.parse(decrypt((mailbox.credentials as any).encrypted, ENC_KEY));
  }

  // 6. Add tracking pixel + wrap links
  const trackingId = crypto.randomUUID();
  let htmlBody = body;

  if (cc.campaign.trackOpens) {
    htmlBody += `<img src="${API_URL}/t/open/${trackingId}" width="1" height="1" style="display:none" />`;
  }
  if (cc.campaign.trackClicks) {
    htmlBody = htmlBody.replace(/href="(https?:\/\/[^"]+)"/g, (_, url) =>
      `href="${API_URL}/t/click/${trackingId}?url=${encodeURIComponent(url)}"`
    );
  }

  // 7. Add unsubscribe header + link
  const unsubscribeUrl = `${API_URL}/t/unsubscribe/${trackingId}`;
  htmlBody += `<br/><p style="font-size:11px;color:#999;">If you no longer wish to receive these emails, <a href="${unsubscribeUrl}">unsubscribe here</a>.</p>`;

  // 8. Send via SMTP
  const transporter = createTransport({
    host: creds.host || process.env.SMTP_HOST || 'localhost',
    port: creds.port || Number(process.env.SMTP_PORT) || 587,
    secure: creds.useTls ?? false,
    auth: creds.user ? { user: creds.user, pass: creds.pass } : undefined,
  });

  const info = await transporter.sendMail({
    from: mailbox.email,
    to: cc.contact.email,
    subject,
    text: body,
    html: htmlBody,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });

  // 9. Record sent email
  const sentEmail = await prisma.sentEmail.create({
    data: {
      campaignId: cc.campaign.id,
      campaignContactId: cc.id,
      stepId: step.id,
      mailboxId: mailbox.id,
      messageId: info.messageId,
      subject,
      fromEmail: mailbox.email,
      toEmail: cc.contact.email,
      status: 'sent',
    },
  });

  // 10. Update mailbox sent count
  await prisma.mailbox.update({
    where: { id: mailbox.id },
    data: { sentToday: { increment: 1 } },
  });

  // 11. Update campaign contact step
  await prisma.campaignContact.update({
    where: { id: cc.id },
    data: { currentStep: step.stepNumber + 1, status: 'active' },
  });

  // 12. Schedule next step if exists
  const nextStep = cc.campaign.sequenceSteps.find(s => s.stepNumber === step.stepNumber + 1);
  if (nextStep) {
    const delayMs = (nextStep.delayDays || 1) * 24 * 60 * 60 * 1000;
    await sendQueue.add('email.send', { campaignContactId: cc.id, stepId: nextStep.id }, { delay: delayMs });
  } else {
    await prisma.campaignContact.update({
      where: { id: cc.id },
      data: { status: 'finished', finishedAt: new Date() },
    });
  }

  return { sent: true, messageId: info.messageId, to: cc.contact.email };
}, { connection, concurrency: 5 });

sendWorker.on('completed', (job, result) => {
  console.log(`📧 Send job ${job?.id} completed:`, result);
});

sendWorker.on('failed', (job, err) => {
  console.error(`❌ Send job ${job?.id} failed:`, err.message);
});
