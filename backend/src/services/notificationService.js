const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Service de gestion des notifications (Socket.io + Email)
 * @notice Gère les notifications temps réel et emails pour tous les acteurs
 * @dev Utilise Socket.io pour temps réel et nodemailer pour emails
 */
let io = null; // Instance Socket.io (initialisée depuis server.js)
let emailTransporter = null; // Transporter nodemailer

/**
 * Initialise le service de notifications
 * @dev TODO: Implémenter la fonction initNotificationService
 * 
 * @param {Server} socketIOServer - Instance Socket.io depuis server.js
 */
function initNotificationService(socketIOServer) {
  // Stocker l'instance Socket.io
  io = socketIOServer;
  
  // Initialiser le transporter email
  initEmailTransporter();
  
  // Logger l'initialisation
  console.log("✅ Notification service initialized");
}

/**
 * Initialise le transporter email (nodemailer)
 * @dev TODO: Implémenter la fonction initEmailTransporter
 * 
 * Configuration:
 * - Si SENDGRID_API_KEY existe: utiliser SendGrid
 * - Sinon: utiliser SMTP standard
 */
function initEmailTransporter() {
  try {
    // Vérifier si SendGrid est configuré
    if (process.env.SENDGRID_API_KEY) {
      // Configurer SendGrid transporter
      emailTransporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
      console.log("Email transporter initialized with SendGrid");
    } else if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      // Configurer SMTP standard
      emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465', // true pour 465, false pour autres ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        },
        // Ignorer les certificats auto-signés en développement
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production' // Rejeter seulement en production
        }
      });
      console.log("Email transporter initialized with SMTP");
    } else {
      console.warn("⚠️  Email transporter not configured. Email notifications will be disabled.");
      console.warn("💡 Configure SENDGRID_API_KEY or SMTP_USER/SMTP_PASSWORD in .env");
    }
  } catch (error) {
    // Logger l'erreur
    console.error("Error initializing email transporter:", error);
    emailTransporter = null;
  }
}

/**
 * Notifie le restaurant qu'une nouvelle commande a été créée
 * @dev TODO: Implémenter la fonction notifyOrderCreated
 * 
 * @param {number} orderId - ID de la commande
 * @param {string} restaurantId - ID MongoDB du restaurant
 * @param {Object} orderData - Données de la commande (optionnel)
 * @returns {Promise<Object>} { success: true }
 */
async function notifyOrderCreated(orderId, restaurantId, orderData = {}) {
  try {
    // Émettre un event Socket.io vers la room du restaurant
    if (io) {
      io.to(`restaurant_${restaurantId}`).emit('orderCreated', {
        orderId,
        ...orderData
      });
    }
    
    // Récupérer les informations du restaurant depuis MongoDB (si le modèle existe)
    try {
      const Restaurant = require("../models/Restaurant");
      const restaurant = await Restaurant.findById(restaurantId);
      
      // Si le restaurant a un email, envoyer un email
      if (restaurant && restaurant.email && emailTransporter) {
        await sendEmail(
          restaurant.email,
          "Nouvelle commande reçue",
          `Vous avez reçu une nouvelle commande #${orderId}. Connectez-vous pour la traiter.`
        );
      }
    } catch (modelError) {
      // Le modèle Restaurant n'existe peut-être pas encore, continuer sans email
      console.warn("Could not send email notification (Restaurant model may not exist):", modelError.message);
    }
    
    // Retourner succès
    return { success: true };
  } catch (error) {
    // Logger l'erreur
    console.error("Error notifying order created:", error);
    throw error;
  }
}

/**
 * Notifie les livreurs disponibles qu'une commande est disponible
 * @dev TODO: Implémenter la fonction notifyDeliverersAvailable
 * 
 * @param {number} orderId - ID de la commande
 * @param {Array<string>} delivererAddresses - Tableau d'adresses de livreurs disponibles
 * @param {Object} orderData - Données de la commande (optionnel)
 * @returns {Promise<Object>} { success: true }
 */
async function notifyDeliverersAvailable(orderId, delivererAddresses, orderData = {}) {
  try {
    if (!io) {
      console.warn("Socket.io not initialized. Cannot send real-time notifications.");
      return { success: false, message: "Socket.io not initialized" };
    }
    
    // Parcourir chaque adresse de livreur
    for (const delivererAddress of delivererAddresses) {
      // Émettre un event Socket.io vers la room du livreur
      io.to(`deliverer_${delivererAddress.toLowerCase()}`).emit('orderAvailable', {
        orderId,
        ...orderData
      });
    }
    
    // Optionnel: Envoyer des push notifications (FCM/APNS) - à implémenter plus tard
    // if (process.env.FCM_SERVER_KEY) {
    //   // TODO: Implémenter push notifications
    // }
    
    // Retourner succès
    return { success: true };
  } catch (error) {
    // Logger l'erreur
    console.error("Error notifying deliverers:", error);
    throw error;
  }
}

/**
 * Notifie le client d'une mise à jour de statut de commande
 * @dev TODO: Implémenter la fonction notifyClientOrderUpdate
 * 
 * @param {number} orderId - ID de la commande
 * @param {string} clientAddress - Adresse blockchain du client
 * @param {string} status - Nouveau statut (PREPARING, IN_DELIVERY, DELIVERED, etc.)
 * @param {Object} additionalData - Données supplémentaires (optionnel)
 * @returns {Promise<Object>} { success: true }
 */
async function notifyClientOrderUpdate(orderId, clientAddress, status, additionalData = {}) {
  try {
    // Émettre un event Socket.io vers la room du client
    if (io) {
      io.to(`client_${clientAddress.toLowerCase()}`).emit('orderStatusUpdate', {
        orderId,
        status,
        ...additionalData
      });
    }
    
    // Récupérer les informations du client depuis MongoDB
    try {
      const User = require("../models/User");
      const client = await User.findByAddress(clientAddress);
      
      // Si status = DELIVERED, envoyer email de confirmation
      if (status === 'DELIVERED' && client && client.email && emailTransporter) {
        await sendEmail(
          client.email,
          "Commande livrée",
          `Votre commande #${orderId} a été livrée avec succès. Merci pour votre confiance!`
        );
      }
      
      // Si status = IN_DELIVERY, envoyer email avec lien tracking
      if (status === 'IN_DELIVERY' && client && client.email && emailTransporter) {
        const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/orders/${orderId}/tracking`;
        await sendEmail(
          client.email,
          "Votre commande est en route",
          `Votre commande #${orderId} est en cours de livraison. Suivez-la ici: ${trackingUrl}`
        );
      }
    } catch (modelError) {
      // Le modèle User n'existe peut-être pas encore, continuer sans email
      console.warn("Could not send email notification (User model may not exist):", modelError.message);
    }
    
    // Retourner succès
    return { success: true };
  } catch (error) {
    // Logger l'erreur
    console.error("Error notifying client:", error);
    throw error;
  }
}

/**
 * Notifie les arbitres qu'un nouveau litige a été ouvert
 * @dev TODO: Implémenter la fonction notifyArbitrators
 * 
 * @param {number} disputeId - ID du litige
 * @param {number} orderId - ID de la commande
 * @param {Object} disputeData - Données du litige (optionnel)
 * @returns {Promise<Object>} { success: true }
 */
async function notifyArbitrators(disputeId, orderId, disputeData = {}) {
  try {
    // Émettre un event Socket.io vers la room des arbitres
    if (io) {
      io.to('arbitrators').emit('newDispute', {
        disputeId,
        orderId,
        ...disputeData
      });
    }
    
    // Récupérer les emails des arbitres et envoyer des emails
    // Note: Les arbitres peuvent être stockés dans une collection MongoDB ou récupérés depuis le contrat
    // Pour l'instant, on utilise une liste d'emails depuis les variables d'environnement
    if (process.env.ARBITRATOR_EMAILS && emailTransporter) {
      const arbitratorEmails = process.env.ARBITRATOR_EMAILS.split(',').map(email => email.trim());
      
      for (const email of arbitratorEmails) {
        await sendEmail(
          email,
          "Nouveau litige à résoudre",
          `Un nouveau litige #${disputeId} a été ouvert pour la commande #${orderId}. Connectez-vous pour le résoudre.`
        );
      }
    }
    
    // Retourner succès
    return { success: true };
  } catch (error) {
    // Logger l'erreur
    console.error("Error notifying arbitrators:", error);
    throw error;
  }
}

/**
 * Envoie un email
 * @dev TODO: Implémenter la fonction sendEmail
 * 
 * @param {string} to - Adresse email destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} body - Corps de l'email (texte ou HTML)
 * @param {Object} options - Options supplémentaires (html, attachments, etc.)
 * @returns {Promise<Object>} { success: true, messageId }
 */
async function sendEmail(to, subject, body, options = {}) {
  try {
    // Vérifier que le transporter est initialisé
    if (!emailTransporter) {
      console.warn("Email transporter not initialized. Cannot send email.");
      return { success: false, message: "Email transporter not initialized" };
    }
    
    // Préparer les options de l'email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@donefood.com',
      to: to,
      subject: subject,
      text: options.html ? undefined : body,
      html: options.html || body // Si HTML fourni, utiliser HTML, sinon utiliser body comme texte
    };
    
    // Ajouter les pièces jointes si fournies
    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }
    
    // Envoyer l'email
    const info = await emailTransporter.sendMail(mailOptions);
    
    // Logger le succès
    console.log("Email sent:", info.messageId);
    
    // Retourner le résultat
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    // Logger l'erreur
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Récupère l'instance Socket.io
 * @dev TODO: Retourner io
 * @returns {Server|null} Instance Socket.io ou null
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

