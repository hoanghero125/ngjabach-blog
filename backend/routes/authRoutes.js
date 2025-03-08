const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // console.log('Login attempt:', { username, password });
  try {
    const user = await User.findOne({ username });
    // console.log('Found user:', user);
    if (!user || user.password !== password) {
      // console.log('Invalid credentials - User:', user, 'Password match:', user?.password === password);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;