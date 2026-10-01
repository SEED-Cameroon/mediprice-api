import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/** Name of the httpOnly cookie that carries the session token. */
export const SESSION_COOKIE = 'mp_session';

/** Reads one cookie from the raw Cookie header (no cookie-parser needed). */
function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

const notAuthorized = (res) => res.status(401).json({ success: false, data: null, message: 'Not authorized' });

/**
 * Auth middleware. Accepts the session from the httpOnly cookie set at login,
 * or an `Authorization: Bearer <token>` header (for API tools and scripts).
 * Verifies the JWT with HS256 only (rejects `alg: none` and anything else),
 * then loads the user so role changes and deletions take effect at once.
 * Attaches `req.user = { id, name, email, role, providerId }`.
 *
 * Responds 401 with a generic message on any failure, so it never reveals
 * whether the token was missing, expired or forged.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function auth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : readCookie(req, SESSION_COOKIE);
  if (!token) return notAuthorized(res);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findById(decoded.sub ?? decoded.id).lean();
    if (!user) return notAuthorized(res);

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      providerId: user.providerId ? String(user.providerId) : null,
    };
    next();
  } catch {
    return notAuthorized(res);
  }
}

/**
 * Allows the request only for the given roles. Use after `auth`.
 * @param {...("user" | "provider" | "admin")} roles
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, data: null, message: 'You do not have permission to do this' });
    }
    next();
  };
}

/**
 * CSRF guard for cookie sessions: state-changing requests must declare a
 * JSON body. Browsers can't send a cross-site JSON request without a CORS
 * preflight, which the CORS allow-list rejects, so a forged form post from
 * another site never reaches a handler.
 */
export function requireJson(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.headers['content-type']?.startsWith('application/json')) return next();
  return res.status(415).json({ success: false, data: null, message: 'Requests must be sent as JSON' });
}

/**
 * Small in-memory rate limiter (per IP), for the login endpoint.
 * Good enough for one server; use a shared store if the API is scaled out.
 * @param {{ windowMs: number, max: number }} options
 */
export function rateLimit({ windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const entry = hits.get(req.ip);
    if (!entry || entry.resetAt < now) {
      hits.set(req.ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({
        success: false,
        data: null,
        message: 'Too many attempts. Please wait a few minutes and try again.',
      });
    }
    next();
  };
}
