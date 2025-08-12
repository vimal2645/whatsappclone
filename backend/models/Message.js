const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: String,
  wa_id: String,
  name: String,
  text: String,
  timestamp: Date,
  fromMe: Boolean,
  status: String
});

module.exports = mongoose.model('Message', messageSchema);
