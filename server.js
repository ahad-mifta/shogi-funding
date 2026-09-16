const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const https = require('https');

const app = express();
const publicDirectory = path.join(__dirname, 'public');
const investorDeckPath = path.join(publicDirectory, 'SHOGI-Systems-Inc-Seed-Deck.pdf');

app.get('/', async (req, res) => {
  const seedRoundPagePath = path.join(__dirname, 'public', 'seed-round-investor-page.html');
  await sendHtmlWithInsights(res, seedRoundPagePath);
});

app.get('/SHOGI-Systems-Inc-Seed-Deck.pdf', (req, res) => {
  res.sendFile(investorDeckPath);
});

// Serve static files from public directory
app.use(express.static(publicDirectory));

// Proxy endpoint to bypass ad blockers - fetches Vercel insights script from unrecognizable URL
app.get('/lib/telemetry.js', (req, res) => {
  const options = {
    hostname: 'vercel.com',
    port: 443,
    path: '/_vercel/insights/script.js',
    method: 'GET',
    headers: { 'User-Agent': 'Node.js' }
  };

  https.get(options, (proxyRes) => {
    res.type('application/javascript');
    proxyRes.pipe(res);
  }).on('error', (error) => {
    console.error('Failed to fetch insights script:', error);
    res.status(500).send('');
  });
});

// Primary route for Seed Round Investor Page
const INSIGHTS_SCRIPT_TAG = '<script defer src="/lib/telemetry.js"></script>';

async function sendHtmlWithInsights(res, filePath) {
  try {
    const html = await fs.readFile(filePath, 'utf8');
    const withInsights = html.includes('/_vercel/insights/script.js')
      ? html
      : html.replace('</head>', `  ${INSIGHTS_SCRIPT_TAG}\n</head>`);

    res.type('html').send(withInsights);
  } catch (error) {
    console.error(`Failed to serve ${filePath}:`, error);
    res.status(500).send('Internal Server Error');
  }
}

const seedRoundPagePath = path.join(__dirname, 'public', 'seed-round-investor-page.html');

app.get('/seed-round-investor-page', async (req, res) => {
  await sendHtmlWithInsights(res, seedRoundPagePath);
});

// Redirect root and /seed-round to /seed-round-investor-page
app.get('/seed-round', (req, res) => {
  res.redirect(301, '/seed-round-investor-page');
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Seed Round Investor Page: http://localhost:${PORT}/seed-round-investor-page`);
});
