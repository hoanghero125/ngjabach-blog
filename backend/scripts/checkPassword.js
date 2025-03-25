require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const checkPassword = async () => {
  try {
    const user = await User.findOne({ username: 'ngjabach' });
    if (!user) {
      console.log('User not found');
      return mongoose.connection.close();
    }

    const isMatch = await bcrypt.compare('bachgotphd', user.password);
    console.log('Password match:', isMatch);

    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
    mongoose.connection.close();
  }
};

checkPassword();