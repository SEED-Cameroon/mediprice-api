import mongoose from 'mongoose';
import Price from '../models/Price.js';
import PriceHistory from '../models/PriceHistory.js';
import Provider from '../models/Provider.js';
import Medication from '../models/Medication.js';
import Service from '../models/Service.js';
import { PROVIDER_FIELDS } from '../utils/prices.js';

const ITEM_MODELS = { medication: Medication, service: Service };
const TRUST_BADGES = ['seed_verified', 'provider_verified', 'community_reported', 'unverified'];
const MAX_AMOUNT = 10_000_000; // FCFA; anything above is almost certainly a typo
const MAX_IMPORT_ROWS = 2000;

const fail = (res, status, message) => res.status(status).json({ success: false, data: null, message });

/**
 * Runs `work(session)` in a transaction, so a price change and its history
 * row are saved together or not at all.
 */
async function inTransaction(work) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

class PriceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Validates an amount in FCFA: a whole number between 1 and MAX_AMOUNT. */
function parseAmount(value) {
  const amount = Number(value);
  if (!Number.isInteger(amount) || amount <= 0 || amount > MAX_AMOUNT) {
    throw new PriceError(`Price must be a whole number of FCFA between 1 and ${MAX_AMOUNT.toLocaleString('en-US')}`);
  }
  return amount;
}

/** Validates an optional "checked on" date: not in the future, not before 2000. */
function parseCheckedAt(value) {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new PriceError('Checked date is not a valid date');
  if (date > new Date()) throw new PriceError('Checked date cannot be in the future');
  if (date.getFullYear() < 2000) throw new PriceError('Checked date is too far in the past');
  return date;
}

/**
 * Works out which provider and badge a change applies to, for the signed-in
 * user. Providers can only touch their own prices, and their prices are always
 * "provider_verified". Admins choose (default "seed_verified").
 */
function resolveActor(user, { providerId, trustBadge }) {
  if (user.role === 'provider') {
    if (!user.providerId) throw new PriceError('Your account is not linked to a provider yet. Ask the SEED team.', 403);
    if (providerId && String(providerId) !== user.providerId) {
      throw new PriceError('You can only change your own prices', 403);
    }
    return { providerId: user.providerId, trustBadge: 'provider_verified', source: 'provider' };
  }

  const badge = trustBadge || 'seed_verified';
  if (!TRUST_BADGES.includes(badge)) throw new PriceError(`Trust badge must be one of: ${TRUST_BADGES.join(', ')}`);
  return { providerId, trustBadge: badge, source: 'admin' };
}

/**
 * Creates or updates the price for one item at one provider, and records the
 * change in PriceHistory. Re-saving the same amount still counts as a fresh
 * check: updatedAt moves forward so the "Checked N days ago" label is right.
 *
 * @returns {Promise<{ price: object, change: "created" | "updated" | "unchanged" }>}
 */
async function savePrice({ itemType, itemId, providerId, amount, trustBadge, checkedAt, source, userId, session }) {
  const existing = await Price.findOne({ itemType, itemId, providerId }).session(session ?? null);
  const updatedAt = checkedAt ?? new Date();

  if (!existing) {
    const [price] = await Price.create(
      [{ itemType, itemId, providerId, amount, trustBadge, createdAt: updatedAt, updatedAt }],
      { session, timestamps: false },
    );
    await PriceHistory.create(
      [{ priceId: price._id, itemType, itemId, providerId, change: 'created', previousAmount: null, amount, trustBadge, source, changedBy: userId }],
      { session },
    );
    return { price, change: 'created' };
  }

  const previousAmount = existing.amount;
  const changed = previousAmount !== amount || existing.trustBadge !== trustBadge;

  await Price.updateOne(
    { _id: existing._id },
    { $set: { amount, trustBadge, updatedAt } },
    { session, timestamps: false },
  );
  if (changed) {
    await PriceHistory.create(
      [{ priceId: existing._id, itemType, itemId, providerId, change: 'updated', previousAmount, amount, trustBadge, source, changedBy: userId }],
      { session },
    );
  }
  return { price: { ...existing.toObject(), amount, trustBadge, updatedAt }, change: changed ? 'updated' : 'unchanged' };
}

/** Attaches the item (medication or service) each price row is for. */
async function withItems(rows) {
  const idsFor = (type) => rows.filter((row) => row.itemType === type).map((row) => row.itemId);
  const [medications, services] = await Promise.all([
    Medication.find({ _id: { $in: idsFor('medication') } }, 'name category form').lean(),
    Service.find({ _id: { $in: idsFor('service') } }, 'name category type').lean(),
  ]);
  const items = new Map([...medications, ...services].map((item) => [String(item._id), item]));
  return rows.map((row) => ({ ...row, item: items.get(String(row.itemId)) ?? null }));
}

/**
 * GET /api/prices — prices the signed-in user can manage.
 * Admins see everything (filter with itemType, itemId, providerId, badge);
 * providers see only their own.
 */
export async function listPrices(req, res, next) {
  try {
    const { itemType, itemId, providerId, badge } = req.query;
    const filter = {};
    if (itemType) filter.itemType = itemType;
    if (itemId && mongoose.isValidObjectId(itemId)) filter.itemId = itemId;
    if (badge) filter.trustBadge = badge;
    if (req.user.role === 'provider') filter.providerId = req.user.providerId;
    else if (providerId && mongoose.isValidObjectId(providerId)) filter.providerId = providerId;

    const rows = await Price.find(filter).sort({ updatedAt: -1 }).populate('providerId', PROVIDER_FIELDS).lean();
    res.json({ success: true, data: await withItems(rows), message: 'Prices retrieved successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/prices — add a price, or update it if this provider already has
 * one for the item. Body: { itemType, itemId, providerId (admin only), amount,
 * trustBadge (admin only), checkedAt (optional) }.
 */
export async function upsertPrice(req, res, next) {
  try {
    const { itemType, itemId, amount, checkedAt } = req.body ?? {};
    const Model = ITEM_MODELS[itemType];
    if (!Model) return fail(res, 400, "itemType must be 'medication' or 'service'");
    if (!mongoose.isValidObjectId(itemId)) return fail(res, 400, 'Choose a medicine or service');

    const actor = resolveActor(req.user, req.body);
    if (!mongoose.isValidObjectId(actor.providerId)) return fail(res, 400, 'Choose a provider');

    const [item, provider] = await Promise.all([Model.exists({ _id: itemId }), Provider.exists({ _id: actor.providerId })]);
    if (!item) return fail(res, 404, 'That medicine or service no longer exists');
    if (!provider) return fail(res, 404, 'That provider no longer exists');

    const values = {
      itemType,
      itemId,
      providerId: actor.providerId,
      amount: parseAmount(amount),
      trustBadge: actor.trustBadge,
      checkedAt: parseCheckedAt(checkedAt),
      source: actor.source,
      userId: req.user.id,
    };
    const result = await inTransaction((session) => savePrice({ ...values, session }));

    res.status(result.change === 'created' ? 201 : 200).json({
      success: true,
      data: { ...result.price, change: result.change },
      message: result.change === 'created' ? 'Price added' : 'Price updated',
    });
  } catch (error) {
    if (error instanceof PriceError) return fail(res, error.status, error.message);
    next(error);
  }
}

/** Loads a price and checks the signed-in user may change it. */
async function findOwnedPrice(req, res) {
  const price = mongoose.isValidObjectId(req.params.id) ? await Price.findById(req.params.id) : null;
  if (!price) {
    fail(res, 404, 'Price not found');
    return null;
  }
  if (req.user.role === 'provider' && String(price.providerId) !== req.user.providerId) {
    fail(res, 403, 'You can only change your own prices');
    return null;
  }
  return price;
}

/** PATCH /api/prices/:id — body: { amount, trustBadge (admin only), checkedAt }. */
export async function updatePrice(req, res, next) {
  try {
    const price = await findOwnedPrice(req, res);
    if (!price) return;

    const actor = resolveActor(req.user, { providerId: price.providerId, trustBadge: req.body?.trustBadge ?? price.trustBadge });
    const values = {
      itemType: price.itemType,
      itemId: price.itemId,
      providerId: price.providerId,
      amount: parseAmount(req.body?.amount ?? price.amount),
      trustBadge: actor.trustBadge,
      checkedAt: parseCheckedAt(req.body?.checkedAt),
      source: actor.source,
      userId: req.user.id,
    };
    const result = await inTransaction((session) => savePrice({ ...values, session }));

    res.json({ success: true, data: { ...result.price, change: result.change }, message: 'Price updated' });
  } catch (error) {
    if (error instanceof PriceError) return fail(res, error.status, error.message);
    next(error);
  }
}

/** DELETE /api/prices/:id — removes a price; the history keeps a record. */
export async function deletePrice(req, res, next) {
  try {
    const price = await findOwnedPrice(req, res);
    if (!price) return;

    await inTransaction(async (session) => {
      await PriceHistory.create(
        [
          {
            priceId: price._id,
            itemType: price.itemType,
            itemId: price.itemId,
            providerId: price.providerId,
            change: 'deleted',
            previousAmount: price.amount,
            amount: price.amount,
            trustBadge: price.trustBadge,
            source: req.user.role === 'provider' ? 'provider' : 'admin',
            changedBy: req.user.id,
          },
        ],
        { session },
      );
      await Price.deleteOne({ _id: price._id }, { session });
    });

    res.json({ success: true, data: null, message: 'Price removed' });
  } catch (error) {
    next(error);
  }
}

/** GET /api/prices/:id/history — every change to one price, newest first. */
export async function priceHistory(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 404, 'Price not found');
    const history = await PriceHistory.find({ priceId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('changedBy', 'name role')
      .lean();

    if (req.user.role === 'provider' && history.some((row) => String(row.providerId) !== req.user.providerId)) {
      return fail(res, 403, 'You can only see your own prices');
    }
    res.json({ success: true, data: history, message: 'Price history retrieved successfully' });
  } catch (error) {
    next(error);
  }
}

const normaliseName = (text) => String(text ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * POST /api/prices/import — admin bulk import from a spreadsheet.
 * Body: { rows: [{ itemType, item, provider, amount, trustBadge?, checkedAt? }], dryRun }
 * `item` and `provider` are names, matched case-insensitively. Unknown names
 * are rejected (not created) so a typo can't add a duplicate.
 * With dryRun: true nothing is saved; the response says what would happen.
 */
export async function importPrices(req, res, next) {
  try {
    const { rows, dryRun = true } = req.body ?? {};
    if (!Array.isArray(rows) || rows.length === 0) return fail(res, 400, 'The file has no rows to import');
    if (rows.length > MAX_IMPORT_ROWS) return fail(res, 400, `Import at most ${MAX_IMPORT_ROWS} rows at a time`);

    const [medications, services, providers] = await Promise.all([
      Medication.find({}, 'name').lean(),
      Service.find({}, 'name').lean(),
      Provider.find({}, 'name').lean(),
    ]);
    const index = (docs) => new Map(docs.map((doc) => [normaliseName(doc.name), doc]));
    const lookup = { medication: index(medications), service: index(services), provider: index(providers) };

    const results = [];
    const seen = new Set();

    for (const [position, row] of rows.entries()) {
      const line = position + 2; // spreadsheet row number (row 1 is the header)
      try {
        const itemType = normaliseName(row.itemType);
        if (!ITEM_MODELS[itemType]) throw new PriceError("Type must be 'medication' or 'service'");

        const item = lookup[itemType].get(normaliseName(row.item));
        if (!item) throw new PriceError(`No ${itemType} called "${row.item ?? ''}". Add it first, or check the spelling.`);

        const provider = lookup.provider.get(normaliseName(row.provider));
        if (!provider) throw new PriceError(`No provider called "${row.provider ?? ''}". Add it first, or check the spelling.`);

        const key = `${itemType}:${item._id}:${provider._id}`;
        if (seen.has(key)) throw new PriceError('Duplicate of an earlier row (same item and provider)');
        seen.add(key);

        const badge = row.trustBadge ? normaliseName(row.trustBadge).replace(/[\s-]+/g, '_') : 'seed_verified';
        if (!TRUST_BADGES.includes(badge)) throw new PriceError(`Trust badge must be one of: ${TRUST_BADGES.join(', ')}`);

        const entry = {
          line,
          itemType,
          itemId: item._id,
          item: item.name,
          providerId: provider._id,
          provider: provider.name,
          amount: parseAmount(row.amount),
          trustBadge: badge,
          checkedAt: parseCheckedAt(row.checkedAt),
        };

        const existing = await Price.findOne({ itemType, itemId: item._id, providerId: provider._id }, 'amount trustBadge').lean();
        entry.previousAmount = existing?.amount ?? null;
        entry.status = !existing ? 'create' : existing.amount !== entry.amount || existing.trustBadge !== badge ? 'update' : 'unchanged';
        results.push(entry);
      } catch (error) {
        if (!(error instanceof PriceError)) throw error;
        results.push({ line, status: 'error', message: error.message, item: row.item, provider: row.provider });
      }
    }

    if (!dryRun) {
      // One transaction for the whole file: either every valid row is saved or none.
      await inTransaction(async (session) => {
        for (const entry of results.filter((result) => result.status !== 'error')) {
          await savePrice({ ...entry, source: 'import', userId: req.user.id, session });
        }
      });
      console.info(`[import] ${req.user.id} imported ${results.filter((r) => r.status !== 'error').length} price rows`);
    }

    const count = (status) => results.filter((result) => result.status === status).length;
    res.json({
      success: true,
      data: {
        dryRun: Boolean(dryRun),
        summary: { create: count('create'), update: count('update'), unchanged: count('unchanged'), error: count('error') },
        rows: results,
      },
      message: dryRun ? 'Checked the file. Nothing has been saved yet.' : 'Import complete',
    });
  } catch (error) {
    next(error);
  }
}
