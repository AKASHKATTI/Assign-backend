const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    created_at: { type: Date },
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    country_code: { type: String, trim: true },
    mobile_without_country_code: { type: String, trim: true },
    company: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    lead_owner: { type: String, trim: true },
    crm_status: { type: String, trim: true },
    crm_note: { type: String, trim: true },
    data_source: { type: String, trim: true },
    possession_time: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

accountSchema.index({ email: 1 }, { sparse: true }); // Index on email, but allow nulls
accountSchema.index({ mobile_without_country_code: 1 }, { sparse: true });

module.exports = mongoose.model("Account", accountSchema);