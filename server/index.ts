import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*'}));
app.use(express.json());

// --- Simple in-memory session store
type SessionRec = {
  state: string;
  redirectUri: string;
  token?: string;
  createdAt: number;
};
const SESS = new Map<string, SessionRec>();

// env
const STORE          = (process.env.SHOPIFY_STORE || '').trim();        // e.g. "z4huee-wa.myshopify.com"
const CLIENT_ID      = process.env.SHOPIFY_CLIENT_ID || '';
const CLIENT_SECRET  = process.env.SHOPIFY_CLIENT_SECRET || '';
const BACKEND_BASE   = (process.env.BACKEND_BASE || '').replace(/\/$/, ''); // e.g. "https://your-service.onrender.com"

if (!CLIENT_ID || !CLIENT_SECRET) {
  // Not fatal for building, but warn early.
  console.warn('WARNING: Missing SHOPIFY_CLIENT_ID/SHOPIFY_CLIENT_SECRET env vars');
}

function randomId(bytes = 16) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

/**
 * Start OAuth (OTP) flow
 * GET /customer-auth/start?store={store}&redirect_uri={deeplink}
 */
app.get('/customer-auth/start', (req, res) => {
  const store = (String(req.query.store || STORE) || '').trim();
  const redirectUri = String(req.query.redirect_uri || '');

  if (!store || !redirectUri || !CLIENT_ID || !CLIENT_SECRET || !BACKEND_BASE) {
    return res.status(400).send('Missing store, redirect_uri, or server env config');
  }

  const sessionId = randomId(16);
  const state = randomId(8);
  SESS.set(sessionId, { state, redirectUri, createdAt: Date.now() });

  const authorize = new URL('https://accounts.shopify.com/oauth/authorize');
  authorize.searchParams.set('client_id', CLIENT_ID);
  authorize.searchParams.set('scope', 'openid email');
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('store', store);
  authorize.searchParams.set('redirect_uri', `${BACKEND_BASE}/customer-auth/callback?session=${sessionId}`);

  return res.redirect(authorize.toString());
});

/**
 * OAuth callback from Shopify
 * GET /customer-auth/callback?code=...&state=...&session=...
 */
app.get('/customer-auth/callback', async (req, res) => {
  try {
    const code = String(req.query.code || '');
    const state = String(req.query.state || '');
    const sessionId = String(req.query.session || '');

    const rec = SESS.get(sessionId);
    if (!rec || rec.state !== state) return res.status(400).send('Invalid session/state');

    // Exchange code -> token
    const tokenRes = await fetch('https://accounts.shopify.com/oauth/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: `${BACKEND_BASE}/customer-auth/callback?session=${sessionId}`
      })
    });

    if (!tokenRes.ok) {
      const txt = await tokenRes.text();
      console.error('Token exchange failed:', txt);
      return res.status(400).send('Token exchange failed');
    }

    const tokenJson = await tokenRes.json() as any; // { access_token, id_token, ... }
    rec.token = tokenJson.access_token;
    SESS.set(sessionId, rec);

    // Send user back into the app with the session id
    const appRedirect = `${rec.redirectUri}${rec.redirectUri.includes('?') ? '&' : '?'}session=${sessionId}`;
    return res.redirect(appRedirect);
  } catch (e) {
    console.error(e);
    return res.status(500).send('Callback error');
  }
});

/**
 * Polling endpoint for the app
 * GET /customer-auth/result?session=...
 */
app.get('/customer-auth/result', (req, res) => {
  const sessionId = String(req.query.session || '');
  const rec = SESS.get(sessionId);
  if (!rec || !rec.token) return res.json({ status: 'pending' });
  return res.json({ status: 'ok', token: rec.token });
});

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`Auth server listening on :${PORT}`);
});
