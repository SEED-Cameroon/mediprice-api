import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "pharmacy",
      enum: ["pharmacy", "lab", "hospital"],
      required: true,
    },
    quarter: String,
    address: String,
    city: {
        type: String,
        default: "Bamenda",
        required: true,
    },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    // Optional: only stored when the provider has published it.
    phone: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// providerSchema.index({ location: '2dsphere'});

const Provider = mongoose.model('Provider', providerSchema);

export default Provider;
