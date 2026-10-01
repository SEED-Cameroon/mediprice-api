/**
 * Seeds a development database with sample providers, medications,
 * services and prices.
 *
 *   npm run seed            # only runs if the database has no medications or services yet
 *   npm run seed -- --reset # deletes existing providers, medications, services and prices first
 *
 * Refuses to run when NODE_ENV=production.
 */
import 'dotenv/config';
import mongoose from 'mongoose';

import Medication from '../src/models/Medication.js';
import Price from '../src/models/Price.js';
import Provider from '../src/models/Provider.js';
import Service from '../src/models/Service.js';
import { medications, prices, providers, services } from './seed-data.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const reset = process.argv.includes('--reset');

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed: NODE_ENV is production.');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Add it to .env first.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}`);

  const existing = (await Medication.countDocuments()) + (await Service.countDocuments());
  if (existing > 0 && !reset) {
    console.log(
      `The database already has ${existing} medications/services, so nothing was changed.\n` +
        'Run "npm run seed -- --reset" to replace them with the sample data.',
    );
    return;
  }

  if (reset) {
    await Promise.all([Price.deleteMany({}), Medication.deleteMany({}), Service.deleteMany({}), Provider.deleteMany({})]);
    console.log('Cleared providers, medications, services and prices.');
  }

  const providerDocs = await Provider.insertMany(providers);
  const medicationDocs = await Medication.insertMany(medications);
  const serviceDocs = await Service.insertMany(services);

  const idOf = (docs, name) => {
    const doc = docs.find((entry) => entry.name === name);
    if (!doc) throw new Error(`Seed data references unknown name: ${name}`);
    return doc._id;
  };

  // Insert through the collection so updatedAt can be set to the sample date
  // (Mongoose timestamps would otherwise stamp every price "today").
  const now = Date.now();
  await Price.collection.insertMany(
    prices.map((price) => {
      const updatedAt = new Date(now - price.daysAgo * DAY_MS);
      return {
        itemType: price.itemType,
        itemId: idOf(price.itemType === 'medication' ? medicationDocs : serviceDocs, price.item),
        providerId: idOf(providerDocs, price.provider),
        amount: price.amount,
        trustBadge: price.trustBadge,
        reportedBy: null,
        createdAt: updatedAt,
        updatedAt,
        __v: 0,
      };
    }),
  );

  console.log(
    `Seeded ${providerDocs.length} providers, ${medicationDocs.length} medications, ` +
      `${serviceDocs.length} services and ${prices.length} prices.`,
  );
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
