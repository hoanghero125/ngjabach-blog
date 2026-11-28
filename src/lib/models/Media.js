const mongoose = require('mongoose');

// Uploaded images and PDFs, stored in MongoDB so no extra service is needed.
// Served by GET /api/media/<id>. Max 4 MB each (see src/lib/media-server.ts).
const mediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  data: { type: Buffer, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Media || mongoose.model('Media', mediaSchema);
