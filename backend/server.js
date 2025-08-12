const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Message = require('./models/Message');

const app = express();

// ✅ Allow only your Vercel frontend
app.use(cors({
  origin: ["https://whatsappclone-rouge.vercel.app"],
  credentials: true
}));
app.use(express.json());

// API routes
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

app.post('/api/messages', async (req, res) => {
  try {
    await new Message(req.body).save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/messages/status', async (req, res) => {
  try {
    await Message.findOneAndUpdate({ id: req.body.id }, { status: req.body.status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
  });
