const mongoose = require('mongoose');

// One document (key "main") holding every section edited in Admin → Site content.
// `data.<section>` is validated by src/lib/site/validate.ts before it is saved.
const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now },
  },
  { minimize: false }
);

module.exports = mongoose.models.SiteContent || mongoose.model('SiteContent', siteContentSchema);
