const bcrypt = require('bcrypt');
const dbConnect = require('../../../lib/db');
const User = require('../../../lib/models/User');
const LoginAttempt = require('../../../lib/models/LoginAttempt');
const { signSession, setSessionCookie, isSameOrigin } = require('../../../lib/auth');

const MAX_FAILURES_PER_IP = 10;
const MAX_FAILURES_PER_USERNAME = 30;

// Compared against when the username does not exist, so a wrong username takes
// as long as a wrong password (no username discovery by timing).
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 10);

function getClientIp(req) {
  // On Vercel these headers are set by the platform, not by the client.
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp) return realIp;
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
  if (!isSameOrigin(req)) {
    return res.status(403).json({ message: 'Cross-site request blocked' });
  }

  const { username, password } = req.body || {};
  if (
    typeof username !== 'string' || typeof password !== 'string' ||
    !username || !password || username.length > 100 || password.length > 200
  ) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    await dbConnect();

    const since = new Date(Date.now() - LoginAttempt.WINDOW_SECONDS * 1000);
    const ipKey = `ip:${getClientIp(req)}`;
    const userKey = `user:${username.toLowerCase()}`;
    const [ipFailures, userFailures] = await Promise.all([
      LoginAttempt.countDocuments({ key: ipKey, createdAt: { $gte: since } }),
      LoginAttempt.countDocuments({ key: userKey, createdAt: { $gte: since } }),
    ]);
    if (ipFailures >= MAX_FAILURES_PER_IP || userFailures >= MAX_FAILURES_PER_USERNAME) {
      res.setHeader('Retry-After', String(LoginAttempt.WINDOW_SECONDS));
      return res.status(429).json({ message: 'Too many failed attempts. Try again in 15 minutes.' });
    }

    const user = await User.findOne({ username });
    const isMatch = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
    if (!user || !isMatch) {
      await LoginAttempt.insertMany([{ key: ipKey }, { key: userKey }]);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await LoginAttempt.deleteMany({ key: ipKey });
    setSessionCookie(res, signSession(user));
    return res.status(200).json({ username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
