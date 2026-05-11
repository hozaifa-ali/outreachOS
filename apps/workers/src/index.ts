import 'dotenv/config';
import { sendWorker } from './send-worker';
import { enrichmentWorker } from './enrichment-worker';

console.log('🔧 Starting OutreachOS workers...');

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down workers...');
  await sendWorker.close();
  await enrichmentWorker.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('✅ Send worker running');
console.log('✅ Enrichment worker running');
