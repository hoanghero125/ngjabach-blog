const jwt = require('jsonwebtoken');
const dbConnect = require('./db');
const User = require('./models/User');

// Session = signed JWT stored in an httpOnly cookie, so page scripts (and any
// injected script) can never read it. SameSite=Strict + the Origin check below
// stop other websites from making requests with it (CSRF).
const COOKIE_NAME = 'ngjb_session';
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

function signSession(user) {
  return jwt.sign(
    { sub: String(user._id), ver: user.tokenVersion || 0 },
    getSecret(),
    { algorithm: 'HS256', expiresIn: MAX_AGE_SECONDS }
  );
}

function cookieAttributes(maxAge) {
  const parts = [`Path=/`, `HttpOnly`, `SameSite=Strict`, `Max-Age=${maxAge}`];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; ${cookieAttributes(MAX_AGE_SECONDS)}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; ${cookieAttributes(0)}`);
}

// Rejects state-changing requests that come from another website.
function isSameOrigin(req) {
  if (!UNSAFE_METHODS.has(req.method)) return true;
  const origin = req.headers.origin;
  if (!origin) return true; // non-browser client: it cannot hold the httpOnly cookie anyway
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// Returns the logged-in user document, or null.
async function getSessionUser(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, getSecret(), { algorithms: ['HS256'] });
  } catch {
    return null;
  }
  await dbConnect();
  const user = await User.findById(payload.sub).select('username tokenVersion');
  // tokenVersion is bumped on logout / password reset, which revokes old sessions.
  if (!user || (user.tokenVersion || 0) !== payload.ver) return null;
  return user;
}

// Wraps an API handler so it only runs for a logged-in admin.
function requireAuth(handler) {
  return async (req, res) => {
    if (!isSameOrigin(req)) {
      return res.status(403).json({ message: 'Cross-site request blocked' });
    }
    try {
      const user = await getSessionUser(req);
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      req.user = user;
    } catch (err) {
      console.error('Auth check failed:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    return handler(req, res);
  };
}

module.exports = {
  COOKIE_NAME,
  signSession,
  setSessionCookie,
  clearSessionCookie,
  isSameOrigin,
  getSessionUser,
  requireAuth,
};
