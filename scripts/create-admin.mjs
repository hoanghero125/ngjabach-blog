// Creates the admin account, or resets its password if it already exists.
//
//   npm run create-admin
//
// Reads MONGODB_URI from .env.local. Resetting a password also signs out every
// existing session for that account.
import { createRequire } from 'node:module';
import readline from 'node:readline';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true });
const require = createRequire(import.meta.url);
const mongoose = require('mongoose');
const User = require('../src/lib/models/User.js');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY, prompt: '' });
let muted = false;
// While a password is typed, echo nothing (the prompt itself is still shown).
const writeToOutput = rl._writeToOutput.bind(rl);
rl._writeToOutput = (text) => {
  if (!muted) writeToOutput(text);
};

// Lines can arrive before their prompt (pasted or piped input), so queue them.
const pendingLines = [];
let waiting = null;
rl.on('line', (line) => {
  if (waiting) {
    const resolve = waiting;
    waiting = null;
    resolve(line);
  } else {
    pendingLines.push(line);
  }
});
rl.on('close', () => waiting?.(''));

function ask(question, { hidden = false } = {}) {
  writeToOutput(question);
  muted = hidden;
  return new Promise((resolve) => {
    const done = (answer) => {
      if (hidden && process.stdin.isTTY) writeToOutput('\n');
      muted = false;
      resolve(answer);
    };
    if (pendingLines.length) done(pendingLines.shift());
    else waiting = done;
  });
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Add it to .env.local first (see .env.local.example).');
    process.exit(1);
  }

  const username = (await ask('Admin username: ')).trim();
  if (!username) throw new Error('Username is required');
  const password = await ask('New password (min 12 characters): ', { hidden: true });
  if (password.length < 12) throw new Error('Password must be at least 12 characters');
  const confirm = await ask('Repeat password: ', { hidden: true });
  if (password !== confirm) throw new Error('Passwords do not match');

  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await User.findOne({ username });
  if (existing) {
    existing.password = password; // hashed by the model's pre-save hook
    existing.tokenVersion = (existing.tokenVersion || 0) + 1;
    await existing.save();
    console.log(`Password reset for "${username}". All existing sessions were signed out.`);
  } else {
    await User.create({ username, password });
    console.log(`Admin account "${username}" created.`);
  }
}

main()
  .catch((err) => {
    console.error('Error:', err.message);
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
    return mongoose.disconnect();
  });
