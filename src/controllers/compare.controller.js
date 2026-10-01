import Medication from '../models/Medication.js';
import Service from '../models/Service.js';
import Price from '../models/Price.js';
import { PROVIDER_FIELDS, validObjectIds } from '../utils/prices.js';

const MODELS_BY_ITEM_TYPE = {
  medication: Medication,
  service: Service,
};

/**
 * GET /api/compare
 * Accepts multiple item ids of the same itemType and returns each item's
 * full price-comparison rows (joined with provider) in one response, so the
 * frontend can render a side-by-side table without N separate detail calls.
 *
 * Query: itemType=medication|service, ids=id1,id2,id3
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function comparePrices(req, res, next) {
  try {
    const { itemType, ids } = req.query;

    const Model = MODELS_BY_ITEM_TYPE[itemType];
    if (!Model) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Query param 'itemType' must be 'medication' or 'service'",
      });
    }

    // Malformed ids are dropped rather than failing the whole comparison.
    const itemIds = validObjectIds(
      String(ids || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    );

    if (itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Query param 'ids' must be a comma-separated list of item ids",
      });
    }

    const items = await Model.find({ _id: { $in: itemIds } });

    const prices = await Price.find({
      itemType,
      itemId: { $in: itemIds },
    }).populate('providerId', PROVIDER_FIELDS);

    const pricesByItemId = new Map();
    for (const price of prices) {
      const key = String(price.itemId);
      if (!pricesByItemId.has(key)) pricesByItemId.set(key, []);
      pricesByItemId.get(key).push(price);
    }

    const data = items.map((item) => ({
      ...item.toObject(),
      prices: pricesByItemId.get(String(item._id)) || [],
    }));

    res.status(200).json({
      success: true,
      data,
      message: 'Comparison rows retrieved successfully',
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}
