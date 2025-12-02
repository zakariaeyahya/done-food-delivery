const mongoose = require("mongoose");
require("dotenv").config();

/**
 * Configuration de la connexion MongoDB
 * @notice Configure et gère la connexion à MongoDB via Mongoose
 * @dev Utilise mongoose pour les opérations de base de données
 */
let connectionStatus = 0; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting

/**
 * Établit la connexion à MongoDB
 * @dev TODO: Implémenter la fonction connectDB
 * 
 * Étapes:
 * 1. Vérifier que MONGODB_URI existe dans .env
 * 2. Configurer les options de connexion mongoose
 * 3. Établir la connexion avec mongoose.connect()
 * 4. Gérer les événements de connexion (connected, error, disconnected)
 * 5. Logger le succès ou l'erreur
 * 
 * Variables d'environnement requises:
 * - MONGODB_URI: URI de connexion MongoDB (ex: mongodb://localhost:27017/done_food_delivery)
 * - DB_NAME: Nom de la base de données (optionnel, peut être dans l'URI)
 * 
 * Options mongoose:
 * - useNewUrlParser: true
 * - useUnifiedTopology: true
 * 
 * @returns {Promise<void>} Promise qui se résout quand la connexion est établie
 */
async function connectDB() {
  try {
    // Vérifier que MONGODB_URI existe dans .env
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    // Vérifier si déjà connecté
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB already connected");
      return;
    }

    // Mettre à jour le statut de connexion à "connecting"
    connectionStatus = 2; // connecting

    // Configurer les options de connexion
    const options = {
      // Note: useNewUrlParser et useUnifiedTopology sont dépréciés dans Mongoose 7+
      // mais on les garde pour compatibilité si version antérieure
      maxPoolSize: 10, // Nombre max de connexions dans le pool
      serverSelectionTimeoutMS: 5000, // Timeout pour sélectionner un serveur
      socketTimeoutMS: 45000, // Timeout pour les opérations socket
    };

    // Établir la connexion
    await mongoose.connect(process.env.MONGODB_URI, options);

    // Gérer l'événement 'connected'
    mongoose.connection.on('connected', () => {
      connectionStatus = 1; // connected
      console.log(`MongoDB connected successfully to: ${mongoose.connection.host}`);
      console.log(`Database: ${mongoose.connection.name}`);
    });

    // Gérer l'événement 'error'
    mongoose.connection.on('error', (err) => {
      connectionStatus = 0; // disconnected
      console.error("MongoDB connection error:", err);
    });

    // Gérer l'événement 'disconnected'
    mongoose.connection.on('disconnected', () => {
      connectionStatus = 0; // disconnected
      console.log("MongoDB disconnected");
    });

    // Gérer le processus de fermeture de l'application
    process.on('SIGINT', async () => {
      await disconnectDB();
      process.exit(0);
    });

  } catch (error) {
    // Logger l'erreur
    connectionStatus = 0; // disconnected
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

/**
 * Ferme la connexion MongoDB proprement
 * @dev TODO: Implémenter la fonction disconnectDB
 * 
 * Utilisé lors du shutdown de l'application pour fermer proprement la connexion
 * 
 * @returns {Promise<void>} Promise qui se résout quand la connexion est fermée
 */
async function disconnectDB() {
  try {
    // Vérifier si connecté
    if (mongoose.connection.readyState === 0) {
      console.log("MongoDB already disconnected");
      return;
    }

    // Mettre à jour le statut à "disconnecting"
    connectionStatus = 3; // disconnecting

    // Fermer la connexion
    await mongoose.connection.close();

    // Mettre à jour le statut à "disconnected"
    connectionStatus = 0; // disconnected

    // Logger le succès
    console.log("MongoDB disconnected successfully");
  } catch (error) {
    // Logger l'erreur
    console.error("Error disconnecting from MongoDB:", error);
    throw error;
  }
}

/**
 * Récupère l'état actuel de la connexion
 * @dev TODO: Implémenter la fonction getConnectionStatus
 * 
 * États possibles:
 * - 0: disconnected (déconnecté)
 * - 1: connected (connecté)
 * - 2: connecting (en cours de connexion)
 * - 3: disconnecting (en cours de déconnexion)
 * 
 * @returns {number} État de la connexion (0, 1, 2, ou 3)
 */
function getConnectionStatus() {
  // Retourner l'état de connexion depuis mongoose.connection.readyState
  return mongoose.connection.readyState;
  // Note: mongoose.connection.readyState retourne directement l'état
}

/**
 * Vérifie si MongoDB est connecté
 * @dev TODO: Implémenter la fonction isConnected
 * 
 * @returns {boolean} True si connecté (readyState === 1), false sinon
 */
function isConnected() {
  // Vérifier si readyState === 1
  return mongoose.connection.readyState === 1;
}

/**
 * Récupère l'instance mongoose
 * @dev TODO: Retourner mongoose
 * @returns {Object} Instance mongoose
 */
function getMongoose() {
  return mongoose;
}

/**
 * Récupère la connexion mongoose
 * @dev TODO: Retourner mongoose.connection
 * @returns {Object} Objet de connexion mongoose
 */
function getConnection() {
  return mongoose.connection;
}

/**
 * Récupère le nom de la base de données
 * @dev TODO: Retourner le nom de la DB
 * @returns {string} Nom de la base de données
 */
function getDatabaseName() {
  return mongoose.connection.name;
}

/**
 * Récupère l'URI de connexion (sans mot de passe)
 * @dev TODO: Retourner l'URI masquée pour sécurité
 * @returns {string} URI masquée
 */
function getConnectionURI() {
  // Masquer le mot de passe dans l'URI pour sécurité
  const uri = process.env.MONGODB_URI || "";
  return uri.replace(/:[^:@]+@/, ":****@"); // Masquer le mot de passe
}

// Exporter les fonctions
module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  isConnected,
  getMongoose,
  getConnection,
  getDatabaseName,
  getConnectionURI,
  mongoose
};
