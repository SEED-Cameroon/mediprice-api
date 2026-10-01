import mongoose from "mongoose";

/**
 * One row per change to a price: who changed it, from what, to what.
 * Rows are never edited or deleted, so this doubles as an audit trail.
 */
const priceHistorySchema = new mongoose.Schema(
  {
    priceId: { type: mongoose.Schema.Types.ObjectId, ref: "Price", required: true },
    itemType: { type: String, enum: ["medication", "service"], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
    change: { type: String, enum: ["created", "updated", "deleted"], required: true },
    previousAmount: { type: Number, default: null },
    amount: { type: Number, required: true },
    trustBadge: { type: String },
    source: { type: String, enum: ["admin", "provider", "import"], required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

priceHistorySchema.index({ priceId: 1, createdAt: -1 });
priceHistorySchema.index({ itemId: 1, createdAt: -1 });

const PriceHistory = mongoose.model("PriceHistory", priceHistorySchema);

export default PriceHistory;
