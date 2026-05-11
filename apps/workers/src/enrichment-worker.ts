import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@outreachos/db';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

export const enrichmentQueue = new Queue('enrichment', { connection });

export const enrichmentWorker = new Worker('enrichment', async (job) => {
  const { contactIds, orgId } = job.data as { contactIds: string[]; orgId: string };

  for (const contactId of contactIds) {
    const contact = await prisma.contact.findFirst({ where: { id: contactId, orgId } });
    if (!contact) continue;

    // Enrichment via external APIs would go here:
    // 1. Clearbit Enrichment API → company data
    // 2. Apollo → phone, LinkedIn
    // 3. Hunter.io → email verification

    // For now, mark as enriched
    await prisma.contact.update({
      where: { id: contactId },
      data: { enrichedAt: new Date() },
    });
  }

  return { enriched: contactIds.length };
}, { connection, concurrency: 3 });

enrichmentWorker.on('completed', (job, result) => {
  console.log(`🔍 Enrichment job ${job?.id} completed:`, result);
});

enrichmentWorker.on('failed', (job, err) => {
  console.error(`❌ Enrichment job ${job?.id} failed:`, err.message);
});
