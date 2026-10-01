import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, trim:true },
    genericName: { type: String, trim: true, },
    category: { type: String, required: true },
    description: { type: String, required: true, },
    // What one price covers, e.g. "Tablets, pack of 10". Prices are only
    // comparable for the same form and quantity.
    form: { type: String, trim: true },
    requiresPrescription: { type: Boolean, default: false },
  },
  { timestamps: true }
);

medicationSchema.index({ name: 'text', genericName: 'text' });

medicationSchema.index({ category: 1 });

const Medication = mongoose.model('Medication', medicationSchema);

export default Medication;

