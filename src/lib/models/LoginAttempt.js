const mongoose = require('mongoose');

// One document per failed login. MongoDB deletes each one automatically after
// 15 minutes (TTL index), so counts always cover the last 15 minutes.
const WINDOW_SECONDS = 15 * 60;

const loginAttemptSchema = new mongoose.Schema({
  key: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, expires: WINDOW_SECONDS },
});

const LoginAttempt =
  mongoose.models.LoginAttempt || mongoose.model('LoginAttempt', loginAttemptSchema);

module.exports = LoginAttempt;
module.exports.WINDOW_SECONDS = WINDOW_SECONDS;
