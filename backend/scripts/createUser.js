require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

console.log('Current directory:', __dirname);
console.log('MONGODB_URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const createUser = async () => {
  try {
    await User.deleteMany({});
    console.log('Deleted all existing users');

    const username = 'ngjabach';
    const password = 'bachgotphd';

    const user = new User({
      username: username,
      password: password, 
    });

    await user.save();
    console.log('User created:', user);

    mongoose.connection.close();
  } catch (err) {
    console.error('Error creating user:', err);
    mongoose.connection.close();
  }
};

createUser();