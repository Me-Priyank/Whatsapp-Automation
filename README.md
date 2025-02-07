# WhatsApp Automation

Automate sending scheduled messages, including customized text and images, on WhatsApp using Node.js and WhatsApp Web API.

## Features
- **Scheduled Messaging**: Automatically send messages at a specified time.
- **Group & Personal Chats**: Send messages to individuals or groups using chat IDs.
- **QR-Based Authentication**: Secure login via QR code scanning.
- **Custom Messages with Images**: Send personalized messages along with media attachments.
- **Cloud Deployment**: Run 24/7 on platforms like Render or Railway.

## Installation

### Prerequisites
- Node.js installed on your system
- WhatsApp Web logged in using QR authentication
- Git for version control

### Steps to Set Up
1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/whatsapp-automation.git
   cd whatsapp-automation
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run the application:
   ```sh
   node index.js
   ```
4. Scan the QR code displayed in the terminal with WhatsApp Web.
5. The bot will start running and send messages based on the schedule.


## Deployment
To keep the bot running 24/7, deploy it on platforms like:
- **Railway**: Configure environment variables and deploy.
- **Render**: Set up an always-on service.
- **PM2**: Use PM2 for local machine execution:
  ```sh
  npm install -g pm2
  pm2 start index.js --name whatsapp-bot
  ```


