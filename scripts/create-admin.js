/**
 * Creates the first admin account, or promotes an existing account to admin.
 *
 *   npm run create-admin -- --email you@seed.cm --name "Your Name"
 *
 * Asks for the password without echoing it. For an existing account, leave
 * the password empty to keep the current one.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import readline from 'node:readline';
import User from '../src/models/User.js';
import { BCRYPT_COST } from '../src/controllers/auth.controller.js';

const arg = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index > -1 ? process.argv[index + 1] : undefined;
};

/** Reads a line from the terminal without showing what is typed. */
function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => {
      if (text.includes(question)) rl.output.write(text);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

async function main() {
  const email = arg('email')?.toLowerCase();
  const name = arg('name');
  if (!email) throw new Error('Usage: npm run create-admin -- --email you@example.com --name "Your Name"');
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set. Add it to .env first.');

  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email });

  // Non-interactive use (CI): ADMIN_PASSWORD may be set in the environment.
  const password =
    process.env.ADMIN_PASSWORD ??
    (await askHidden(existing ? 'New password (leave empty to keep the current one): ' : 'Password (8+ characters): '));

  if (password && password.length < 8) throw new Error('Password must be at least 8 characters.');

  if (existing) {
    existing.role = 'admin';
    existing.providerId = null;
    if (name) existing.name = name;
    if (password) existing.passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    existing.failedLoginCount = 0;
    existing.lockedUntil = null;
    await existing.save();
    console.log(`${email} is now an admin.`);
    return;
  }

  if (!name) throw new Error('Add --name "Your Name" for a new account.');
  if (!password) throw new Error('A password is required for a new account.');
  await User.create({ name, email, role: 'admin', passwordHash: await bcrypt.hash(password, BCRYPT_COST) });
  console.log(`Created admin account for ${email}.`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
