const nodemailer = require("nodemailer");
const axios = require("axios");
require("dotenv").config();

let emailTransporter = null;
let alertRateLimiter = new Map();

function initEmailTransporter() {
  try {
    if (process.env.ALERT_EMAIL && process.env.ALERT_EMAIL_PASSWORD) {
      emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.ALERT_EMAIL,
          pass: process.env.ALERT_EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      });
    }
  } catch (error) {
    emailTransporter = null;
  }
}

function checkRateLimit(key, maxAlerts = 5, windowMs = 60000) {
  const now = Date.now();
  const limiter = alertRateLimiter.get(key);

  if (!limiter || now > limiter.resetTime) {
    alertRateLimiter.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (limiter.count >= maxAlerts) {
    return false;
  }

  limiter.count++;
  return true;
}

async function sendEmail(severity, message, details = {}) {
  if (!emailTransporter) {
    return { success: false, message: "Email transporter not initialized" };
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.ALERT_EMAIL;
    if (!adminEmail) {
      return { success: false, message: "ADMIN_EMAIL not configured" };
    }

    const subject = `[${severity}] ${message}`;
    const body = `
Alert Details:
- Severity: ${severity}
- Message: ${message}
- Timestamp: ${new Date().toISOString()}
- Details: ${JSON.stringify(details, null, 2)}
    `.trim();

    const mailOptions = {
      from: process.env.ALERT_EMAIL,
      to: adminEmail,
      subject: subject,
      text: body
    };

    const info = await emailTransporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function sendSlack(severity, message, details = {}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return { success: false, message: "SLACK_WEBHOOK_URL not configured" };
  }

  try {
    const color = severity === 'CRITICAL' ? 'danger' : severity === 'WARNING' ? 'warning' : 'good';

    const payload = {
      text: `[${severity}] ${message}`,
      attachments: [{
        color: color,
        fields: [
          { title: 'Severity', value: severity, short: true },
          { title: 'Message', value: message, short: false },
          { title: 'Timestamp', value: new Date().toISOString(), short: true },
          { title: 'Details', value: JSON.stringify(details, null, 2), short: false }
        ]
      }]
    };

    await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function sendAlert(severity, message, details = {}) {
  const validSeverities = ['INFO', 'WARNING', 'CRITICAL'];
  if (!validSeverities.includes(severity)) {
    throw new Error(`Invalid severity: ${severity}. Must be one of: ${validSeverities.join(', ')}`);
  }

  const rateLimitKey = `${severity}_${message.substring(0, 50)}`;
  if (!checkRateLimit(rateLimitKey, 5, 60000)) {
    return { success: false, message: "Rate limited" };
  }

  const results = await Promise.allSettled([
    sendEmail(severity, message, details),
    sendSlack(severity, message, details)
  ]);

  const emailResult = results[0].status === 'fulfilled' ? results[0].value : { success: false, error: results[0].reason };
  const slackResult = results[1].status === 'fulfilled' ? results[1].value : { success: false, error: results[1].reason };

  return {
    success: emailResult.success || slackResult.success,
    email: emailResult,
    slack: slackResult
  };
}

initEmailTransporter();

module.exports = {
  sendAlert,
  sendEmail,
  sendSlack,
  initEmailTransporter
};
