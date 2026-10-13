import 'dotenv/config';
import { createApp } from './app.js';
import { createMailer, isWhatsAppConfigured } from './contact.js';

const PORT = process.env.PORT || 8787;
const mailer = createMailer();

createApp({ mailer }).listen(PORT, () => {
  console.info(`Contact API listening on http://localhost:${PORT}`);
  console.info(`  email:    ${mailer ? 'configured' : 'NOT configured (set SMTP_* in .env)'}`);
  console.info(
    `  whatsapp: ${isWhatsAppConfigured() ? 'configured' : 'NOT configured (set WHATSAPP_* in .env)'}`,
  );
});
