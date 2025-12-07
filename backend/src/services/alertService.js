const nodemailer = require("nodemailer");
const axios = require("axios");
require("dotenv").config();

/**
 * Alert Service - Alert system for monitoring and incidents
 * 
 * Responsibilities:
 * - Send email alerts in case of problems
 * - Slack/Discord notifications for DevOps team
 * - Severity levels: INFO, WARNING, CRITICAL
 * - Logging alerts in MongoDB (optional)
 * 
 * Usage:
 * const alertService = require('./services/alertService');
 * await alertService.sendAlert('CRITICAL', 'MongoDB Connection Failed', {
 *   error: error.message,
 *   timestamp: Date.now()
 * });
 */

let emailTransporter = null;
let alertRateLimiter = new Map(); // Simple rate limiter: key -> { count, resetTime }

/**
 * Initialize email transporter
 */
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
      console.log("✅ Alert email transporter initialized");
    } else {
      console.warn("⚠️  Alert email not configured. Email alerts will be disabled.");
    }
  } catch (error) {
    console.error("Error initializing alert email transporter:", error);
    emailTransporter = null;
  }
}

/**
 * Check rate limit for alerts
 * @param {string} key - Alert key (e.g., 'mongodb_connection_failed')
 * @param {number} maxAlerts - Maximum alerts per time window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} True if alert should be sent, false if rate limited
 */
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

/**
 * Send alert via email
 * @param {string} severity - Severity level (INFO, WARNING, CRITICAL)
 * @param {string} message - Alert message
 * @param {Object} details - Additional details
 * @returns {Promise<Object>} Result
 */
async function sendEmail(severity, message, details = {}) {
  if (!emailTransporter) {
    console.warn("Email transporter not initialized. Cannot send alert email.");
    return { success: false, message: "Email transporter not initialized" };
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.ALERT_EMAIL;
    if (!adminEmail) {
      console.warn("ADMIN_EMAIL not configured. Cannot send alert email.");
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
    console.log(`✅ Alert email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending alert email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send alert via Slack webhook
 * @param {string} severity - Severity level
 * @param {string} message - Alert message
 * @param {Object} details - Additional details
 * @returns {Promise<Object>} Result
 */
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

    console.log(`✅ Alert sent to Slack`);
    return { success: true };
  } catch (error) {
    console.error("Error sending alert to Slack:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send alert (email + Slack)
 * @param {string} severity - Severity level (INFO, WARNING, CRITICAL)
 * @param {string} message - Alert message
 * @param {Object} details - Additional details
 * @returns {Promise<Object>} Result
 */
async function sendAlert(severity, message, details = {}) {
  // Validate severity
  const validSeverities = ['INFO', 'WARNING', 'CRITICAL'];
  if (!validSeverities.includes(severity)) {
    throw new Error(`Invalid severity: ${severity}. Must be one of: ${validSeverities.join(', ')}`);
  }

  // Rate limiting: prevent spam
  const rateLimitKey = `${severity}_${message.substring(0, 50)}`;
  if (!checkRateLimit(rateLimitKey, 5, 60000)) {
    console.warn(`⚠️  Alert rate limited: ${message}`);
    return { success: false, message: "Rate limited" };
  }

  // Log alert
  console.log(`🚨 [${severity}] ${message}`, details);

  // Send via email and Slack (parallel)
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

// Initialize on module load
initEmailTransporter();

module.exports = {
  sendAlert,
  sendEmail,
  sendSlack,
  initEmailTransporter
};
