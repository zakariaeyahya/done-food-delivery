const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Notification Service (Socket.io + Email)
 * @notice Manages real-time notifications and emails for all actors
 * @dev Uses Socket.io for real-time and nodemailer for emails
 */
let io = null; // Socket.io instance (initialized from server.js)
let emailTransporter = null; // Nodemailer transporter

/**
 * Initialize notification service
 * @param {Server} socketIOServer - Socket.io instance from server.js
 */
function initNotificationService(socketIOServer) {
  io = socketIOServer;
  initEmailTransporter();
  console.log("✅ Notification service initialized");
}

/**
 * Initialize email transporter (nodemailer)
 * 
 * Configuration:
 * - If SENDGRID_API_KEY exists: use SendGrid
 * - Otherwise: use standard SMTP
 */
function initEmailTransporter() {
  try {
    if (process.env.SENDGRID_API_KEY) {
      emailTransporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
      console.log("Email transporter initialized with SendGrid");
    } else if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      });
      console.log("Email transporter initialized with SMTP");
    } else {
      console.warn("⚠️  Email transporter not configured. Email notifications will be disabled.");
      console.warn("💡 Configure SENDGRID_API_KEY or SMTP_USER/SMTP_PASSWORD in .env");
    }
  } catch (error) {
    console.error("Error initializing email transporter:", error);
    emailTransporter = null;
  }
}

/**
 * Notify restaurant that a new order has been created
 * @param {number} orderId - Order ID
 * @param {string} restaurantId - MongoDB restaurant ID
 * @param {Object} orderData - Order data (optional)
 * @returns {Promise<Object>} { success: true }
 */
async function notifyOrderCreated(orderId, restaurantId, orderData = {}) {
  try {
    if (io) {
      io.to(`restaurant_${restaurantId}`).emit('orderCreated', {
        orderId,
        ...orderData
      });
    }
    
    try {
      const Restaurant = require("../models/Restaurant");
      const restaurant = await Restaurant.findById(restaurantId);
      
      if (restaurant && restaurant.email && emailTransporter) {
        await sendEmail(
          restaurant.email,
          "New order received",
          `You have received a new order #${orderId}. Please log in to process it.`
        );
      }
    } catch (modelError) {
      console.warn("Could not send email notification (Restaurant model may not exist):", modelError.message);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error notifying order created:", error);
    throw error;
  }
}

/**
 * Notify available deliverers that an order is available
 * @param {number} orderId - Order ID
 * @param {Array<string>} delivererAddresses - Array of available deliverer addresses
 * @param {Object} orderData - Order data (optional)
 * @returns {Promise<Object>} { success: true }
 */
async function notifyDeliverersAvailable(orderId, delivererAddresses, orderData = {}) {
  try {
    if (!io) {
      console.warn("Socket.io not initialized. Cannot send real-time notifications.");
      return { success: false, message: "Socket.io not initialized" };
    }
    
    for (const delivererAddress of delivererAddresses) {
      io.to(`deliverer_${delivererAddress.toLowerCase()}`).emit('orderAvailable', {
        orderId,
        ...orderData
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error notifying deliverers:", error);
    throw error;
  }
}

/**
 * Notify client of order status update
 * @param {number} orderId - Order ID
 * @param {string} clientAddress - Client blockchain address
 * @param {string} status - New status (PREPARING, IN_DELIVERY, DELIVERED, etc.)
 * @param {Object} additionalData - Additional data (optional)
 * @returns {Promise<Object>} { success: true }
 */
async function notifyClientOrderUpdate(orderId, clientAddress, status, additionalData = {}) {
  try {
    if (io) {
      io.to(`client_${clientAddress.toLowerCase()}`).emit('orderStatusUpdate', {
        orderId,
        status,
        ...additionalData
      });
    }
    
    try {
      const User = require("../models/User");
      const client = await User.findByAddress(clientAddress);
      
      if (status === 'DELIVERED' && client && client.email && emailTransporter) {
        await sendEmail(
          client.email,
          "Order delivered",
          `Your order #${orderId} has been delivered successfully. Thank you for your trust!`
        );
      }
      
      if (status === 'IN_DELIVERY' && client && client.email && emailTransporter) {
        const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/orders/${orderId}/tracking`;
        await sendEmail(
          client.email,
          "Your order is on the way",
          `Your order #${orderId} is being delivered. Track it here: ${trackingUrl}`
        );
      }
    } catch (modelError) {
      console.warn("Could not send email notification (User model may not exist):", modelError.message);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error notifying client:", error);
    throw error;
  }
}

/**
 * Notify arbitrators that a new dispute has been opened
 * @param {number} disputeId - Dispute ID
 * @param {number} orderId - Order ID
 * @param {Object} disputeData - Dispute data (optional)
 * @returns {Promise<Object>} { success: true }
 */
async function notifyArbitrators(disputeId, orderId, disputeData = {}) {
  try {
    if (io) {
      io.to('arbitrators').emit('newDispute', {
        disputeId,
        orderId,
        ...disputeData
      });
    }
    
    if (process.env.ARBITRATOR_EMAILS && emailTransporter) {
      const arbitratorEmails = process.env.ARBITRATOR_EMAILS.split(',').map(email => email.trim());
      
      for (const email of arbitratorEmails) {
        await sendEmail(
          email,
          "New dispute to resolve",
          `A new dispute #${disputeId} has been opened for order #${orderId}. Please log in to resolve it.`
        );
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error notifying arbitrators:", error);
    throw error;
  }
}

/**
 * Send email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body (text or HTML)
 * @param {Object} options - Additional options (html, attachments, etc.)
 * @returns {Promise<Object>} { success: true, messageId }
 */
async function sendEmail(to, subject, body, options = {}) {
  try {
    if (!emailTransporter) {
      console.warn("Email transporter not initialized. Cannot send email.");
      return { success: false, message: "Email transporter not initialized" };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@donefood.com',
      to: to,
      subject: subject,
      text: options.html ? undefined : body,
      html: options.html || body
    };
    
    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }
    
    const info = await emailTransporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Get Socket.io instance
 * @returns {Server|null} Socket.io instance or null
 */
function getSocketIO() {
  return io;
}

// Exporter toutes les fonctions
module.exports = {
  initNotificationService,
  notifyOrderCreated,
  notifyDeliverersAvailable,
  notifyClientOrderUpdate,
  notifyArbitrators,
  sendEmail,
  getSocketIO
};

