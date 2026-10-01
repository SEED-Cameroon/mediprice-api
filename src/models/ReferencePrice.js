import mongoose from "mongoose";

/**
 * A published, sourced price for a medicine or test in Cameroon (e.g. from a
 * WHO/HAI-method survey). It is not a price at a specific provider, so it is
 * shown separately as context ("typical price in Cameroon"), always with its
 * source and year.
 */
const referencePriceSchema = new mongoose.Schema(
  {
    itemType: { type: String, enum: ["medication", "service"], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // FCFA, exactly as published, for `unit` (e.g. "per tablet").
    amount: { type: Number, required: true },
    unit: { type: String, required: true },
    low: { type: Number, default: null },
    high: { type: Number, default: null },
    // Which kind of outlet the figure describes, e.g. "Private pharmacies".
    sector: { type: String, required: true },
    // Where the figure comes from; shown to users as a link.
    sourceTitle: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    year: { type: Number, required: true },
    region: { type: String, default: "Cameroon" },
    // How the figure was derived, e.g. "median per tablet × 10".
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

referencePriceSchema.index({ itemType: 1, itemId: 1 });

const ReferencePrice = mongoose.model("ReferencePrice", referencePriceSchema);

export default ReferencePrice;
