const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { Client, LocalAuth,MessageMedia } = require('whatsapp-web.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const WHATSAPP_GROUP_ID = process.env.WHATSAPP_GROUP_ID; // Replace with actual group ID

app.use(cors());
app.use(express.json());

// Hardcoded student data for testing 
let studentData = [
  {
    name: 'Priyank',
    birthdate: '2025-01-11', // Format: YYYY-MM-DD
  },
  {
    name: 'John Doe',
    birthdate: '2025-02-15',
  },
  {
    name: 'dada',
    birthdate: '2025-01-11'
  },
  {
    name: 'dada',
    birthdate: '2025-01-07'
  }
];

let isClientReady = false; // Flag to check if WhatsApp client is ready

// Set up WhatsApp client with session persistence
const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
  console.log('Scan this QR code with your WhatsApp:');
  const qrcode = require('qrcode-terminal');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp Client is ready!');
  isClientReady = true;
});

client.on('auth_failure', (msg) => {
  console.error('Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
  console.warn('WhatsApp Client disconnected:', reason);
  isClientReady = false;
});

client.initialize();

// Home route


// Route to check birthdays instantly
app.get('/', (req, res) => {
  res.send('Server is running. Use the / endpoint to test.');

    if (!isClientReady) {
      return res.status(503).json(['WhatsApp client is not ready yet. Please try again later.']);
    }
  
    const today = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
    let messagesSent = [];
  
    studentData.forEach((student) => {
      if (student.birthdate === today) {
        const message = `🎉 Happy Birthday, ${student.name}! 🎂`;
        const imagePath = `./assets/${student.name}.jpg`; // Path to your image file
  
        const media = MessageMedia.fromFilePath(imagePath);
  
        client
          .sendMessage(WHATSAPP_GROUP_ID, media, { caption: message })
          .then(() => {
            console.log(`Birthday wish with image sent for ${student.name}.`);
            messagesSent.push(`Birthday wish with image sent for ${student.name}.`);
          })
          .catch((err) => {
            console.error(`Failed to send message for ${student.name}:`, err);
            messagesSent.push(`Failed to send message for ${student.name}.`);
          });
      }
    });
  
    if (messagesSent.length === 0) {
      res.json(['No birthdays today.']);
    } else {
      res.json(messagesSent);
    }
  });
  

// Schedule a daily job to check birthdays at 9 AM
cron.schedule('0 9 * * *', () => {
  if (!isClientReady) {
    console.warn('WhatsApp client is not ready yet. Skipping scheduled birthday check.');
    return;
  }

  const today = new Date().toLocaleDateString('en-CA');

  studentData.forEach((student) => {
    if (student.birthdate === today) {
      const message = `🎉 Happy Birthday, ${student.name}! 🎂`;

      client
        .sendMessage(WHATSAPP_GROUP_ID, message)
        .then(() => {
          console.log(`Birthday wish sent for ${student.name}.`);
        })
        .catch((err) => {
          console.error(`Failed to send message for ${student.name}:`, err);
        });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});