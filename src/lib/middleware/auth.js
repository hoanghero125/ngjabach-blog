const jwt = require('jsonwebtoken');

const authMiddleware = (handler) => {
  return async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return handler(req, res);
    } catch (err) {
      res.status(401).json({ message: 'Invalid token', error: err.message });
    }
  };
};

module.exports = authMiddleware;