const User = require('../../../lib/models/User');
const { clearSessionCookie, getSessionUser, isSameOrigin } = require('../../../lib/auth');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
  if (!isSameOrigin(req)) {
    return res.status(403).json({ message: 'Cross-site request blocked' });
  }

  try {
    const user = await getSessionUser(req);
    if (user) {
      // Revokes this session and any other copy of it (e.g. other devices).
      await User.updateOne({ _id: user._id }, { $inc: { tokenVersion: 1 } });
    }
  } catch (err) {
    console.error('Logout error:', err);
  }
  clearSessionCookie(res);
  return res.status(200).json({ message: 'Logged out' });
}
