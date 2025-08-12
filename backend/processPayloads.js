const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const Message = require('./models/Message');

async function processPayloads() {
  const folderPath = path.join(__dirname, 'payloads');
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));

  if (!files.length) {
    console.log('⚠ No JSON payload files found.');
    return;
  }

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(folderPath, file), 'utf-8'));
      const value = data.metaData.entry[0].changes[0].value;

      if (value.messages) {
        for (const msg of value.messages) {
          const contact = value.contacts ? value.contacts[0] : null;
          const doc = {
            id: msg.id,
            wa_id: contact ? contact.wa_id : value.statuses?.[0]?.recipient_id,
            name: contact?.profile?.name || '',
            text: msg.text?.body || '',
            timestamp: new Date(parseInt(msg.timestamp) * 1000),
            fromMe: msg.from !== (contact ? contact.wa_id : ''),
            status: 'sent'
          };
          await Message.findOneAndUpdate({ id: doc.id }, doc, { upsert: true });
          console.log(`💾 Saved message from ${doc.name || doc.wa_id}: "${doc.text}"`);
        }
      }

      if (value.statuses) {
        for (const s of value.statuses) {
          await Message.findOneAndUpdate({ id: s.id }, { status: s.status });
          console.log(`🔄 Updated status of ${s.id} to ${s.status}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
    }
  }
  console.log('✅ Payload processing complete.');
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    processPayloads().then(() => mongoose.disconnect());
  })
  .catch(err => console.error('❌ DB Connection Error:', err));


