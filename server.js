const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const https = require('https');
const crypto = require('crypto');

const app = express();
const publicDirectory = path.join(__dirname, 'public');
const investorDeckPath = path.join(publicDirectory, 'SHOGI-Systems-Inc-Seed-Deck.pdf');
const passwordProtectionPagePath = path.join(publicDirectory, 'password-protection.html');
const seedRoundPassword = process.env.SEED_ROUND_PASSWORD || 'SHOGIAuthority!26';
const accessCookieName = 'shogi_seed_round_access';
const accessCookieMaxAge = 8 * 60 * 60 * 1000;

app.use(express.urlencoded({ extended: false }));

function signAccessToken(timestamp) {
  return crypto.createHmac('sha256', seedRoundPassword)
    .update(`seed-round:${timestamp}`)
    .digest('base64url');
}

function hasSeedRoundAccess(req) {
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const separator = part.indexOf('=');
    return [part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1).trim())];
  }));
  const token = cookies[accessCookieName];
  if (!token) return false;

  const [timestamp, signature] = token.split('.');
  const issuedAt = Number(timestamp);
  if (!Number.isSafeInteger(issuedAt) || Date.now() - issuedAt > accessCookieMaxAge || Date.now() < issuedAt) return false;

  const expected = signAccessToken(timestamp);
  return Boolean(signature) && signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function requireSeedRoundAccess(req, res, next) {
  if (hasSeedRoundAccess(req)) return next();
  return res.redirect('/access');
}

app.get('/access', async (req, res) => {
  await sendHtml(res, passwordProtectionPagePath);
});

app.post('/access', (req, res) => {
  const supplied = Buffer.from(typeof req.body.password === 'string' ? req.body.password : '');
  const expected = Buffer.from(seedRoundPassword);
  const valid = supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);

  if (!valid) return res.redirect('/access?error=1');

  const timestamp = String(Date.now());
  const token = `${timestamp}.${signAccessToken(timestamp)}`;
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${accessCookieName}=${encodeURIComponent(token)}; Max-Age=${accessCookieMaxAge / 1000}; Path=/; HttpOnly; SameSite=Lax${secure}`);
  return res.redirect('/seed-round-investor-page');
});

app.get(['/', '/seed-round-investor-page', '/seed-round-investor-page.html'], requireSeedRoundAccess, async (req, res) => {
  const seedRoundPagePath = path.join(__dirname, 'public', 'seed-round-investor-page.html');
  await sendHtmlWithInsights(res, seedRoundPagePath);
});

app.get('/SHOGI-Systems-Inc-Seed-Deck.pdf', requireSeedRoundAccess, (req, res) => {
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

async function sendHtml(res, filePath) {
  try {
    const html = await fs.readFile(filePath, 'utf8');
    res.type('html').send(html);
  } catch (error) {
    console.error(`Failed to serve ${filePath}:`, error);
    res.status(500).send('Internal Server Error');
  }
}

// Redirect root and /seed-round to /seed-round-investor-page
app.get('/seed-round', requireSeedRoundAccess, (req, res) => {
  res.redirect(301, '/seed-round-investor-page');
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Seed Round Investor Page: http://localhost:${PORT}/seed-round-investor-page`);
});
