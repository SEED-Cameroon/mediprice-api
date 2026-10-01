/**
 * Loads real facilities and published reference prices (scripts/real-data.js).
 * No provider prices are added: those come from SEED field visits.
 *
 *   npm run seed:real            # only into an empty catalogue
 *   npm run seed:real -- --reset # replaces providers, medications, services,
 *                                # prices and reference prices (keeps accounts
 *                                # and price history)
 */
import 'dotenv/config';
import mongoose from 'mongoose';

import Medication from '../src/models/Medication.js';
import Price from '../src/models/Price.js';
import Provider from '../src/models/Provider.js';
import ReferencePrice from '../src/models/ReferencePrice.js';
import Service from '../src/models/Service.js';
import User from '../src/models/User.js';
import { medications, providers, services } from './real-data.js';

const reset = process.argv.includes('--reset');

/** Removes fields that only document the data (source, references). */
const record = ({ source, references, ...fields }) => fields;

async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set. Add it to .env first.');
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}`);

  const existing = (await Medication.countDocuments()) + (await Service.countDocuments()) + (await Provider.countDocuments());
  if (existing > 0 && !reset) {
    console.log(
      `The database already has ${existing} providers/medications/services, so nothing was changed.\n` +
        'Run "npm run seed:real -- --reset" to replace them with the real data.',
    );
    return;
  }

  if (reset) {
    await Promise.all([
      Price.deleteMany({}),
      ReferencePrice.deleteMany({}),
      Medication.deleteMany({}),
      Service.deleteMany({}),
      Provider.deleteMany({}),
    ]);
    // Provider accounts pointed at the old providers; unlink them.
    await User.updateMany({ role: 'provider' }, { $set: { providerId: null } });
    console.log('Cleared providers, medications, services, prices and reference prices.');
  }

  const providerDocs = await Provider.insertMany(providers.map(record));
  const medicationDocs = await Medication.insertMany(medications.map(record));
  const serviceDocs = await Service.insertMany(services.map(record));

  const referenceRows = [
    ...medications.flatMap((item, i) =>
      (item.references ?? []).map((ref) => ({ ...ref, itemType: 'medication', itemId: medicationDocs[i]._id })),
    ),
    ...services.flatMap((item, i) =>
      (item.references ?? []).map((ref) => ({ ...ref, itemType: 'service', itemId: serviceDocs[i]._id })),
    ),
  ];
  await ReferencePrice.insertMany(referenceRows);

  console.log(
    `Loaded ${providerDocs.length} providers, ${medicationDocs.length} medications, ${serviceDocs.length} services ` +
      `and ${referenceRows.length} reference prices. No provider prices yet: add them in Admin > Import.`,
  );
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
