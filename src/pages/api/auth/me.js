const { getSessionUser } = require('../../../lib/auth');

// Tells the admin UI whether the session cookie is valid.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
  res.setHeader('Cache-Control', 'no-store');
  try {
    const user = await getSessionUser(req);
    if (!user) return res.status(401).json({ authenticated: false });
    return res.status(200).json({ authenticated: true, username: user.username });
  } catch (err) {
    console.error('Session check error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
