const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Message = require('./models/Message');

async function processPayloads() {
  const folderPath = path.join(__dirname, 'payloads');

  // Read all .json files in payloads folder
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));

  if (!files.length) {
    console.log('⚠ No JSON payload files found.');
    return;
  }

  for (const file of files) {
    try {
      const rawData = fs.readFileSync(path.join(folderPath, file), 'utf-8');
      const data = JSON.parse(rawData);

      // Adjust to your actual payload structure
      const value = data.entry?.[0]?.changes?.[0]?.value 
                 || data.metaData?.entry?.[0]?.changes?.[0]?.value;

      if (!value) {
        console.warn(`⚠ No valid 'value' found in ${file}`);
        continue;
      }

      // ----- Process incoming messages -----
      if (value.messages && Array.isArray(value.messages)) {
        for (const msg of value.messages) {
          const contact = value.contacts ? value.contacts[0] : null;

          const doc = {
            id: msg.id,
            wa_id: contact?.wa_id || value.statuses?.[0]?.recipient_id || '',
            name: contact?.profile?.name || '',
            text: msg.text?.body || '',
            timestamp: new Date(parseInt(msg.timestamp) * 1000),
            fromMe: msg.from !== (contact?.wa_id || ''),
            status: 'received'
          };

          await Message.findOneAndUpdate({ id: doc.id }, doc, { upsert: true });
          console.log(`💾 Saved message from ${doc.name || doc.wa_id}: "${doc.text}"`);
        }
      }

      // ----- Process status updates -----
      if (value.statuses && Array.isArray(value.statuses)) {
        for (const s of value.statuses) {
          await Message.findOneAndUpdate(
            { id: s.id },
            { status: s.status },
            { new: true }
          );
          console.log(`🔄 Updated status of ${s.id} to ${s.status}`);
        }
      }

    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
    }
  }

  console.log('✅ Payload processing complete.');
}

// ===== Connect to DB then run =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB Connected');
  return processPayloads();
})
.then(() => mongoose.disconnect())
.catch(err => console.error('❌ DB Connection Error:', err));
