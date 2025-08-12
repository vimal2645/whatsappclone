const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Mongoose model
const Message = require('./models/Message');

const app = express();

// ===== Middlewares =====
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',                     // Local frontend dev
    'https://whatsappclone-ashen.vercel.app/'           // Replace with your actual deployed frontend URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ===== Database =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// ===== API Routes =====

// Get all conversations grouped by wa_id
app.get('/api/conversations', async (req, res) => {
  try {
    const msgs = await Message.find().sort({ timestamp: 1 });
    const convos = {};
    msgs.forEach(m => {
      if (!convos[m.wa_id]) {
        convos[m.wa_id] = { wa_id: m.wa_id, name: m.name, messages: [] };
      }
      convos[m.wa_id].messages.push(m);
    });
    res.json(Object.values(convos));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new message
app.post('/api/messages', async (req, res) => {
  try {
    await new Message(req.body).save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update message status
app.put('/api/messages/status', async (req, res) => {
  try {
    await Message.findOneAndUpdate({ id: req.body.id }, { status: req.body.status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Optional: Serve frontend build in production =====
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(frontendPath));

  // ✅ Express 5 wildcard syntax: give * a param name (*splat)
  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
