import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Provider from '../models/Provider.js';
import { SESSION_COOKIE } from '../middleware/auth.js';

/** bcrypt cost factor (12+ per the security rules). */
export const BCRYPT_COST = 12;

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
const SESSION_HOURS = Number(process.env.SESSION_HOURS) || 8;

const invalid = (res) =>
  res.status(401).json({ success: false, data: null, message: 'Invalid email or password' });

/** Public shape of a user: never includes the password hash. */
export function publicUser(user, provider = null) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    providerId: user.providerId ? String(user.providerId) : null,
    provider: provider ? { id: String(provider._id), name: provider.name, type: provider.type } : null,
  };
}

/** Session cookie: httpOnly so page scripts can't read it, Secure in production. */
function cookieOptions() {
  const production = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: production,
    // "lax" works when the web app proxies /api (same site). A web app on a
    // different domain from the API needs COOKIE_SAMESITE=none (and HTTPS).
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    maxAge: SESSION_HOURS * 60 * 60 * 1000,
    path: '/',
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, data: null, message: 'Name, email and password are required' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ success: false, data: null, message: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ email: String(email).toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, data: null, message: 'User already exists' });
    }

    // Public sign-ups are always plain users; admins grant other roles.
    const user = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, BCRYPT_COST),
    });

    res.status(201).json({ success: true, data: publicUser(user), message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return invalid(res);

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      console.info(`[auth] failed login for unknown email from ${req.ip}`);
      return invalid(res);
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      console.info(`[auth] login blocked, account locked: ${user._id}`);
      return res.status(423).json({
        success: false,
        data: null,
        message: `Too many failed attempts. Try again in ${LOCK_MINUTES} minutes.`,
      });
    }

    const isMatch = await bcrypt.compare(String(password), user.passwordHash);
    if (!isMatch) {
      user.failedLoginCount += 1;
      if (user.failedLoginCount >= MAX_FAILED_LOGINS) {
        user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        user.failedLoginCount = 0;
        console.info(`[auth] account locked after ${MAX_FAILED_LOGINS} failures: ${user._id}`);
      }
      await user.save();
      console.info(`[auth] failed login: ${user._id} from ${req.ip}`);
      return invalid(res);
    }

    user.failedLoginCount = 0;
    user.lockedUntil = null;
    await user.save();

    // Only the user id goes in the token; role is read fresh on every request.
    const token = jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: `${SESSION_HOURS}h`,
    });

    res.cookie(SESSION_COOKIE, token, cookieOptions());
    console.info(`[auth] login: ${user._id} (${user.role})`);

    const provider = user.providerId ? await Provider.findById(user.providerId).lean() : null;
    res.json({ success: true, data: { user: publicUser(user, provider) }, message: 'Login successful' });
  } catch (error) {
    next(error);
  }
}

export function logout(req, res) {
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie(SESSION_COOKIE, options);
  if (req.user) console.info(`[auth] logout: ${req.user.id}`);
  res.json({ success: true, data: null, message: 'Signed out' });
}

/** GET /api/auth/me: the signed-in user, or 401. */
export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).lean();
    const provider = user.providerId ? await Provider.findById(user.providerId).lean() : null;
    res.json({ success: true, data: publicUser(user, provider), message: 'Signed in' });
  } catch (error) {
    next(error);
  }
}
