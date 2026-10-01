import mongoose from 'mongoose';
import Medication from '../models/Medication.js';
import Service from '../models/Service.js';
import Provider from '../models/Provider.js';
import Price from '../models/Price.js';
import User from '../models/User.js';

const fail = (res, status, message) => res.status(status).json({ success: false, data: null, message });

/** Copies only the allowed, present fields from the request body. */
const pick = (body, fields) =>
  Object.fromEntries(fields.filter((field) => body?.[field] !== undefined).map((field) => [field, body[field]]));

/** Builds PATCH and DELETE handlers for a catalogue model. */
function catalogHandlers(Model, { label, itemType, fields }) {
  return {
    async update(req, res, next) {
      try {
        if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 404, `${label} not found`);
        const doc = await Model.findByIdAndUpdate(req.params.id, pick(req.body, fields), {
          new: true,
          runValidators: true,
        });
        if (!doc) return fail(res, 404, `${label} not found`);
        res.json({ success: true, data: doc, message: `${label} updated` });
      } catch (error) {
        next(error);
      }
    },

    /** Deleting an item also deletes its prices (their history is kept). */
    async remove(req, res, next) {
      try {
        if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 404, `${label} not found`);
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) return fail(res, 404, `${label} not found`);
        const { deletedCount } = await Price.deleteMany(itemType ? { itemType, itemId: doc._id } : { providerId: doc._id });
        if (!itemType) await User.updateMany({ providerId: doc._id }, { $set: { providerId: null } });
        console.info(`[admin] ${req.user.id} deleted ${label.toLowerCase()} ${doc._id} and ${deletedCount} prices`);
        res.json({ success: true, data: { deletedPrices: deletedCount }, message: `${label} deleted` });
      } catch (error) {
        next(error);
      }
    },
  };
}

export const medicationAdmin = catalogHandlers(Medication, {
  label: 'Medication',
  itemType: 'medication',
  fields: ['name', 'genericName', 'category', 'description', 'form', 'requiresPrescription'],
});

export const serviceAdmin = catalogHandlers(Service, {
  label: 'Service',
  itemType: 'service',
  fields: ['name', 'type', 'category', 'description'],
});

const PROVIDER_ADMIN_FIELDS = ['name', 'type', 'quarter', 'address', 'city', 'location', 'phone'];
// Providers can keep their own contact details current, but not rename themselves.
const PROVIDER_SELF_FIELDS = ['quarter', 'address', 'location', 'phone'];

const providerHandlers = catalogHandlers(Provider, { label: 'Provider', fields: PROVIDER_ADMIN_FIELDS });

export const providerAdmin = {
  remove: providerHandlers.remove,

  /** Admins can edit any provider; a provider account only its own contact details. */
  async update(req, res, next) {
    if (req.user.role === 'provider') {
      if (req.user.providerId !== req.params.id) return fail(res, 403, 'You can only edit your own details');
      req.body = pick(req.body, PROVIDER_SELF_FIELDS);
    }
    return providerHandlers.update(req, res, next);
  },
};
