const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedUser = async () => {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username: 'ngjabach' });
    if (existingUser) {
      console.log('User already exists, no changes made:', existingUser);
      return;
    }

    // Create the default user if not found
    const user = new User({
      username: 'ngjabach',
      password: 'bachgotphd'
    });
    await user.save();
    console.log('Default user created:', user);
  } catch (err) {
    console.error('Error seeding user:', err);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedUser();