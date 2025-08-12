const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Mongoose Model
const Message = require('./models/Message');

// Payload processing function
const processPayload = require('./processPayloads');

const app = express();

// ===== MIDDLEWARES =====
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://whatsappclone-ashen.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ===== DATABASE =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// ===== API ROUTES =====

// 1️⃣ List conversations (grouped by wa_id)
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

// 2️⃣ Manual message add (for testing)
app.post('/api/messages', async (req, res) => {
  try {
    await new Message(req.body).save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ Update message status
app.put('/api/messages/status', async (req, res) => {
  try {
    await Message.findOneAndUpdate(
      { id: req.body.id },
      { status: req.body.status }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4️⃣ Webhook endpoint — uses processPayload.js
app.post('/api/webhook', async (req, res) => {
  try {
    console.log('📩 Incoming Webhook Payload:', JSON.stringify(req.body, null, 2));
    await processPayload(req.body); // This should save messages into MongoDB
    res.status(200).send('EVENT_RECEIVED');
  } catch (err) {
    console.error('❌ Webhook processing error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Optional GET webhook verification (if needed by provider)
app.get('/api/webhook', (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === verify_token) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
