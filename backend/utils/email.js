const nodemailer = require('nodemailer');
require('dotenv').config();

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = port === 465; // true for 465, false for other ports
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host) {
    // No SMTP configured; return a mock transporter that logs instead of sending
    cachedTransporter = {
      sendMail: async (opts) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[MAIL MOCK] Would send mail:', {
            to: opts.to,
            subject: opts.subject,
            text: opts.text,
          });
        }
        return { accepted: [opts.to], messageId: 'mock-message-id' };
      }
    };
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  });
  return cachedTransporter;
}

async function sendMail({ to, subject, html, text, from }) {
  try {
    const transporter = getTransporter();
    const defaultFrom = process.env.MAIL_FROM || 'no-reply@nephslair.local';
    return await transporter.sendMail({ from: from || defaultFrom, to, subject, text, html });
  } catch (e) {
    // Avoid breaking user flows if email sending fails
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[MAIL ERROR]', e?.message || e);
    }
    return { accepted: [], messageId: 'failed' };
  }
}

module.exports = { sendMail };
