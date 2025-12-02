// TODO: Importer socket.io pour les notifications temps réel
// const { Server } = require("socket.io");

// TODO: Importer nodemailer pour l'envoi d'emails
// const nodemailer = require("nodemailer");

// TODO: Importer dotenv pour les variables d'environnement
// require("dotenv").config();

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
  // TODO: Stocker l'instance Socket.io
  // io = socketIOServer;
  
  // TODO: Initialiser le transporter email
  // initEmailTransporter();
  
  // TODO: Logger l'initialisation
  // console.log("Notification service initialized");
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
    // TODO: Vérifier si SendGrid est configuré
    // if (process.env.SENDGRID_API_KEY) {
    //   // TODO: Configurer SendGrid transporter
    //   emailTransporter = nodemailer.createTransport({
    //     service: 'SendGrid',
    //     auth: {
    //       user: 'apikey',
    //       pass: process.env.SENDGRID_API_KEY
    //     }
    //   });
    // } else {
    //   // TODO: Configurer SMTP standard
    //   emailTransporter = nodemailer.createTransport({
    //     host: process.env.SMTP_HOST || 'smtp.gmail.com',
    //     port: process.env.SMTP_PORT || 587,
    //     secure: false, // true pour 465, false pour autres ports
    //     auth: {
    //       user: process.env.SMTP_USER,
    //       pass: process.env.SMTP_PASSWORD
    //     }
    //   });
    // }
    
    // TODO: Logger la configuration
    // console.log("Email transporter initialized");
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error initializing email transporter:", error);
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
    // TODO: Émettre un event Socket.io vers la room du restaurant
    // io.to(`restaurant_${restaurantId}`).emit('orderCreated', {
    //   orderId,
    //   ...orderData
    // });
    
    // TODO: Récupérer les informations du restaurant depuis MongoDB
    // const Restaurant = require("../models/Restaurant");
    // const restaurant = await Restaurant.findById(restaurantId);
    
    // TODO: Si le restaurant a un email, envoyer un email
    // if (restaurant && restaurant.email) {
    //   await sendEmail(
    //     restaurant.email,
    //     "Nouvelle commande reçue",
    //     `Vous avez reçu une nouvelle commande #${orderId}. Connectez-vous pour la traiter.`
    //   );
    // }
    
    // TODO: Retourner succès
    // return { success: true };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error notifying order created:", error);
    // throw error;
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
    // TODO: Parcourir chaque adresse de livreur
    // for (const delivererAddress of delivererAddresses) {
    //   // TODO: Émettre un event Socket.io vers la room du livreur
    //   io.to(`deliverer_${delivererAddress.toLowerCase()}`).emit('orderAvailable', {
    //     orderId,
    //     ...orderData
    //   });
    // }
    
    // TODO: Optionnel: Envoyer des push notifications (FCM/APNS)
    // if (process.env.FCM_SERVER_KEY) {
    //   // TODO: Implémenter push notifications
    // }
    
    // TODO: Retourner succès
    // return { success: true };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error notifying deliverers:", error);
    // throw error;
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
    // TODO: Émettre un event Socket.io vers la room du client
    // io.to(`client_${clientAddress.toLowerCase()}`).emit('orderStatusUpdate', {
    //   orderId,
    //   status,
    //   ...additionalData
    // });
    
    // TODO: Récupérer les informations du client depuis MongoDB
    // const User = require("../models/User");
    // const client = await User.findOne({ address: clientAddress.toLowerCase() });
    
    // TODO: Si status = DELIVERED, envoyer email de confirmation
    // if (status === 'DELIVERED' && client && client.email) {
    //   await sendEmail(
    //     client.email,
    //     "Commande livrée",
    //     `Votre commande #${orderId} a été livrée avec succès. Merci pour votre confiance!`
    //   );
    // }
    
    // TODO: Si status = IN_DELIVERY, envoyer email avec lien tracking
    // if (status === 'IN_DELIVERY' && client && client.email) {
    //   const trackingUrl = `${process.env.FRONTEND_URL}/orders/${orderId}/tracking`;
    //   await sendEmail(
    //     client.email,
    //     "Votre commande est en route",
    //     `Votre commande #${orderId} est en cours de livraison. Suivez-la ici: ${trackingUrl}`
    //   );
    // }
    
    // TODO: Retourner succès
    // return { success: true };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error notifying client:", error);
    // throw error;
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
    // TODO: Récupérer la liste des arbitres depuis MongoDB ou blockchain
    // Note: Les arbitres peuvent être stockés dans une collection MongoDB ou récupérés depuis le contrat
    
    // TODO: Émettre un event Socket.io vers la room des arbitres
    // io.to('arbitrators').emit('newDispute', {
    //   disputeId,
    //   orderId,
    //   ...disputeData
    // });
    
    // TODO: Récupérer les emails des arbitres et envoyer des emails
    // const arbitrators = await getArbitratorsList(); // Fonction à implémenter
    // for (const arbitrator of arbitrators) {
    //   if (arbitrator.email) {
    //     await sendEmail(
    //       arbitrator.email,
    //       "Nouveau litige à résoudre",
    //       `Un nouveau litige #${disputeId} a été ouvert pour la commande #${orderId}. Connectez-vous pour le résoudre.`
    //     );
    //   }
    // }
    
    // TODO: Retourner succès
    // return { success: true };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error notifying arbitrators:", error);
    // throw error;
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
    // TODO: Vérifier que le transporter est initialisé
    // if (!emailTransporter) {
    //   throw new Error("Email transporter not initialized");
    // }
    
    // TODO: Préparer les options de l'email
    // const mailOptions = {
    //   from: process.env.EMAIL_FROM || 'noreply@donefood.com',
    //   to: to,
    //   subject: subject,
    //   text: options.html ? undefined : body,
    //   html: options.html || body // Si HTML fourni, utiliser HTML, sinon utiliser body comme texte
    // };
    
    // TODO: Ajouter les pièces jointes si fournies
    // if (options.attachments) {
    //   mailOptions.attachments = options.attachments;
    // }
    
    // TODO: Envoyer l'email
    // const info = await emailTransporter.sendMail(mailOptions);
    
    // TODO: Logger le succès
    // console.log("Email sent:", info.messageId);
    
    // TODO: Retourner le résultat
    // return {
    //   success: true,
    //   messageId: info.messageId
    // };
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error sending email:", error);
    // throw error;
  }
}

/**
 * Récupère l'instance Socket.io
 * @dev TODO: Retourner io
 * @returns {Server|null} Instance Socket.io ou null
 */
function getSocketIO() {
  // TODO: return io;
}

// TODO: Exporter toutes les fonctions
// module.exports = {
//   initNotificationService,
//   notifyOrderCreated,
//   notifyDeliverersAvailable,
//   notifyClientOrderUpdate,
//   notifyArbitrators,
//   sendEmail,
//   getSocketIO
// };

