import 'dotenv/config';
import express from 'express';
import { checkForNewPosts } from './check.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Chuncheon DMAPT Board Scraper',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// Health check for Railway
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Cron endpoint - Railway cron will hit this
app.get('/cron/check', async (req, res) => {
  console.log('\n[CRON] Received check request');

  try {
    const result = await checkForNewPosts();
    res.json(result);
  } catch (error) {
    console.error('[CRON] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST endpoint for manual triggers
app.post('/check', async (req, res) => {
  console.log('\n[MANUAL] Received manual check request');

  try {
    const result = await checkForNewPosts();
    res.json(result);
  } catch (error) {
    console.error('[MANUAL] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`Chuncheon DMAPT Board Scraper`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Endpoints:`);
  console.log(`  GET  /              - Service info`);
  console.log(`  GET  /health        - Health check`);
  console.log(`  GET  /cron/check    - Cron endpoint`);
  console.log(`  POST /check         - Manual check`);
  console.log('='.repeat(50));
});