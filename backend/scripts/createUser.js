require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// In đường dẫn hiện tại để debug
console.log('Current directory:', __dirname);
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Kết nối với MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const createUser = async () => {
  try {
    // Xóa tất cả user hiện có (đảm bảo chỉ có 1 user)
    await User.deleteMany({});
    console.log('Deleted all existing users');

    // Tạo user mới
    const username = 'ngjabach';
    const password = 'bachgotphd';

    // Tạo user (không mã hóa trước, để middleware xử lý)
    const user = new User({
      username: username,
      password: password, // Password dạng plaintext, middleware sẽ mã hóa
    });

    await user.save();
    console.log('User created:', user);

    // Đóng kết nối
    mongoose.connection.close();
  } catch (err) {
    console.error('Error creating user:', err);
    mongoose.connection.close();
  }
};

createUser();