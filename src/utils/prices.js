import mongoose from 'mongoose';
import Price from '../models/Price.js';

/**
 * Provider fields included with every price row, so the frontend can show
 * where a provider is and give directions without extra requests.
 */
export const PROVIDER_FIELDS = 'name type quarter address city location phone';

/**
 * Keeps only syntactically valid ObjectIds, so a bad id in a list or
 * comparison link is ignored instead of throwing a CastError (500).
 *
 * @param {string[]} ids
 * @returns {string[]}
 */
export function validObjectIds(ids) {
  return ids.filter((id) => mongoose.isValidObjectId(id));
}

/**
 * Attaches each item's price rows (with provider populated) using one query
 * for the whole list instead of one per item.
 *
 * @param {"medication" | "service"} itemType
 * @param {Array<{ _id: unknown }>} items - plain objects (use .lean())
 * @returns {Promise<Array<object>>} the items, each with a `prices` array
 */
export async function attachPrices(itemType, items) {
  if (items.length === 0) return [];

  const prices = await Price.find({
    itemType,
    itemId: { $in: items.map((item) => item._id) },
  })
    .populate('providerId', PROVIDER_FIELDS)
    .lean();

  const byItemId = new Map();
  for (const price of prices) {
    const key = String(price.itemId);
    if (!byItemId.has(key)) byItemId.set(key, []);
    byItemId.get(key).push(price);
  }

  return items.map((item) => ({ ...item, prices: byItemId.get(String(item._id)) ?? [] }));
}
