const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, default: null },
  message: { type: String, required: true },
  isPrivate: { type: Boolean, default: false },
  timestamp: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
