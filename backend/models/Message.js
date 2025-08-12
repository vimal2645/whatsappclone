// backend/models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  wa_id: { type: String, required: true },
  name: { type: String },
  text: { type: String },
  timestamp: { type: Date },
  fromMe: { type: Boolean, default: false },
  status: { type: String, default: 'sent' }
});

module.exports = mongoose.model('Message', MessageSchema);
