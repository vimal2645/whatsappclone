const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch(err => console.error('❌ MongoDB Error', err));

app.get('/conversations', async (req, res) => {
  try {
    const msgs = await Message.find().sort({ timestamp: 1 });
    const convos = {};
    msgs.forEach(m => {
      if (!convos[m.wa_id]) convos[m.wa_id] = { wa_id: m.wa_id, name: m.name, messages: [] };
      convos[m.wa_id].messages.push(m);
    });
    res.json(Object.values(convos));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/messages', async (req, res) => {
  try {
    await new Message(req.body).save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/messages/status', async (req, res) => {
  try {
    await Message.findOneAndUpdate({ id: req.body.id }, { status: req.body.status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
