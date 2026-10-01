import mongoose from 'mongoose';

/**
 * Roles:
 *  - user:     signed in, no extra permissions (public registration)
 *  - provider: manages one provider's prices and contact details (providerId)
 *  - admin:    SEED team; manages everything
 */
export const ROLES = ['user', 'provider', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'user',
    },
    // The provider a "provider" account manages.
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      default: null,
    },
    // Account lockout after repeated failed logins.
    failedLoginCount: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
