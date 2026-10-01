import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User, { ROLES } from '../models/User.js';
import Provider from '../models/Provider.js';
import { BCRYPT_COST, publicUser } from './auth.controller.js';

const fail = (res, status, message) => res.status(status).json({ success: false, data: null, message });

/** Checks role/provider rules shared by create and update. */
async function validateRole(role, providerId) {
  if (!ROLES.includes(role)) return `Role must be one of: ${ROLES.join(', ')}`;
  if (role === 'provider') {
    if (!mongoose.isValidObjectId(providerId) || !(await Provider.exists({ _id: providerId }))) {
      return 'Choose the provider this account manages';
    }
  }
  return null;
}

/** GET /api/users — every account, with the provider it manages. */
export async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ role: 1, name: 1 }).populate('providerId', 'name type').lean();
    res.json({
      success: true,
      data: users.map((user) => publicUser({ ...user, providerId: user.providerId?._id ?? null }, user.providerId)),
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/** POST /api/users — admin creates an account. Body: { name, email, password, role, providerId }. */
export async function createUser(req, res, next) {
  try {
    const { name, email, password, role = 'provider', providerId = null } = req.body ?? {};
    if (!name || !email || !password) return fail(res, 400, 'Name, email and password are required');
    if (String(password).length < 8) return fail(res, 400, 'Password must be at least 8 characters');

    const roleError = await validateRole(role, providerId);
    if (roleError) return fail(res, 400, roleError);
    if (await User.exists({ email: String(email).toLowerCase() })) return fail(res, 400, 'An account with that email already exists');

    const user = await User.create({
      name,
      email,
      role,
      providerId: role === 'provider' ? providerId : null,
      passwordHash: await bcrypt.hash(String(password), BCRYPT_COST),
    });
    console.info(`[admin] ${req.user.id} created ${role} account ${user._id}`);
    const provider = user.providerId ? await Provider.findById(user.providerId).lean() : null;
    res.status(201).json({ success: true, data: publicUser(user, provider), message: 'Account created' });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/users/:id — change name, role, linked provider, or reset the password. */
export async function updateUser(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 404, 'Account not found');
    const user = await User.findById(req.params.id);
    if (!user) return fail(res, 404, 'Account not found');

    const { name, role = user.role, providerId = user.providerId, password } = req.body ?? {};
    if (String(user._id) === req.user.id && role !== 'admin') return fail(res, 400, "You can't remove your own admin access");

    const roleError = await validateRole(role, providerId);
    if (roleError) return fail(res, 400, roleError);

    if (name) user.name = name;
    user.role = role;
    user.providerId = role === 'provider' ? providerId : null;
    if (password) {
      if (String(password).length < 8) return fail(res, 400, 'Password must be at least 8 characters');
      user.passwordHash = await bcrypt.hash(String(password), BCRYPT_COST);
      user.failedLoginCount = 0;
      user.lockedUntil = null;
    }
    await user.save();
    console.info(`[admin] ${req.user.id} updated account ${user._id} (${role})`);
    const provider = user.providerId ? await Provider.findById(user.providerId).lean() : null;
    res.json({ success: true, data: publicUser(user, provider), message: 'Account updated' });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/users/:id */
export async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.user.id) return fail(res, 400, "You can't delete your own account");
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 404, 'Account not found');
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return fail(res, 404, 'Account not found');
    console.info(`[admin] ${req.user.id} deleted account ${user._id}`);
    res.json({ success: true, data: null, message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
}
