const express = require('express');
const cors = require('cors');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const WHATSAPP_GROUP_ID = process.env.WHATSAPP_GROUP_ID; // Replace with actual group ID

app.use(cors());
app.use(express.json());

// Hardcoded student data for testing
let studentData = [
  { name: 'priyank', birthdate: '2025-01-12' },
  { name: 'John Doe', birthdate: '2025-02-12' },
  { name: 'dada', birthdate: '2025-01-08' },
  { name: 'dada', birthdate: '2025-01-12' }
];

let isClientReady = false; // Flag to check if WhatsApp client is ready

// Set up WhatsApp client with session persistence
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true, // Set to false if you want to see the browser
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Puppeteer launch args
  }
});

client.on('qr', (qr) => {
  console.log('Scan this QR code with your WhatsApp:');
  const qrcode = require('qrcode-terminal');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('WhatsApp Client is ready!');
  isClientReady = true;

  // Delay to ensure everything is fully loaded before starting
  await new Promise(resolve => setTimeout(resolve, 3000));
});

client.on('auth_failure', (msg) => {
  console.error('Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
  console.warn('WhatsApp Client disconnected:', reason);
  isClientReady = false;

  // Reinitialize the client after a delay
  setTimeout(() => {
    client.initialize().catch((err) => {
      console.error('Error during client reinitialization:', err);
    });
  }, 5000); // Retry after 5 seconds
});

client.initialize().catch((err) => {
  console.error('Error during client initialization:', err);
});

// Function to check birthdays
async function checkBirthdays() {
  if (!isClientReady) {
    console.warn('WhatsApp client is not ready yet. Skipping birthday check.');
    return;
  }

  const today = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
  for (const student of studentData) {
    if (student.birthdate === today) {
      const message = `🎉 Happy Birthday, ${student.name}! 🎂`;
      const imagePath = `./assets/${student.name}.jpg`; // Path to your image file

      try {
        if (fs.existsSync(imagePath)) {
          const media = MessageMedia.fromFilePath(imagePath);
          await client.sendMessage(WHATSAPP_GROUP_ID, media, { caption: message });
          console.log(`Birthday wish with image sent for ${student.name}.`);
        } else {
          await client.sendMessage(WHATSAPP_GROUP_ID, message);
          console.log(`Birthday wish sent for ${student.name} without image.`);
        }
      } catch (err) {
        console.error(`Failed to send message for ${student.name}:`, err);
      }
    }
  }
}

// Route to check birthdays instantly
app.get('/', async (req, res) => {
  if (!isClientReady) {
    return res.status(503).json({ message: 'WhatsApp client is not ready yet. Please try again later.' });
  }

  const today = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
  let messagesSent = [];

  for (const student of studentData) {
    if (student.birthdate === today) {
      const message = `🎉 Happy Birthday, ${student.name}! 🎂`;
      const imagePath = `./assets/${student.name}.jpg`;

      try {
        if (fs.existsSync(imagePath)) {
          const media = MessageMedia.fromFilePath(imagePath);
          await client.sendMessage(WHATSAPP_GROUP_ID, media, { caption: message });
          console.log(`Birthday wish with image sent for ${student.name}.`);
          messagesSent.push(`Birthday wish with image sent for ${student.name}.`);
        } else {
          await client.sendMessage(WHATSAPP_GROUP_ID, message);
          console.log(`Birthday wish sent for ${student.name} without image.`);
          messagesSent.push(`Birthday wish sent for ${student.name} without image.`);
        }
      } catch (err) {
        console.error(`Failed to send message for ${student.name}:`, err);
        messagesSent.push(`Failed to send message for ${student.name}.`);
      }
    }
  }

  if (messagesSent.length === 0) {
    res.json({ message: 'No birthdays today.' });
  } else {
    res.json({ messages: messagesSent });
  }
});
checkBirthdays();
// Schedule the function to run daily
// setInterval(checkBirthdays,  6000); 

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
