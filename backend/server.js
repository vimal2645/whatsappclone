const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Message = require('./models/Message');

const app = express();

// Middleware: Enable CORS, parse JSON
app.use(cors());  // You can restrict origins by passing options if needed
app.use(express.json());

// Connect to MongoDB (await connection before listening)
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB Connected');

    // Start the server only after DB connection is ready
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
  });

// API routes all prefixed by /api to prevent collision with React routes
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

// Serve React static files from frontend/build
const buildPath = path.join(__dirname, 'frontend/build');
app.use(express.static(buildPath));

// Catch-all: send React index.html for any request that doesn't match above routes (to support client-side routing)
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});
