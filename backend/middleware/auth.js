const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  // console.log('Authorization header:', authHeader); 
  // console.log('authMiddleware - Request body before:', req.body);

  if (!authHeader) {
    // console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    // console.log('Invalid token format:', authHeader);
    return res.status(401).json({ message: 'Invalid token format' });
  }

  const token = authHeader.replace('Bearer ', '');
  // console.log('Token:', token); 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Decoded token:', decoded); 
    req.user = decoded;
    // console.log('authMiddleware - Request body after:', req.body); 
    next();
  } catch (err) {
    // console.error('Token verification failed:', err.message);
    res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};

module.exports = authMiddleware;