// TODO: Importer dotenv pour charger les variables d'environnement
// require("dotenv").config();

// TODO: Importer Express
// const express = require("express");

// TODO: Importer Socket.io pour les notifications temps réel
// const { Server } = require("socket.io");

// TODO: Importer http pour créer le serveur HTTP
// const http = require("http");

// TODO: Importer les middlewares
// const cors = require("cors");
// const helmet = require("helmet");
// const morgan = require("morgan");

// TODO: Importer les configurations
// const { connectDB, disconnectDB } = require("./config/database");
// const { initBlockchain, listenEvents } = require("./config/blockchain");
// const { initIPFS } = require("./config/ipfs");

// TODO: Importer les services
// const notificationService = require("./services/notificationService");
// const blockchainService = require("./services/blockchainService");

// TODO: Importer les routes
// const orderRoutes = require("./routes/orders");
// const userRoutes = require("./routes/users");
// const restaurantRoutes = require("./routes/restaurants");
// const delivererRoutes = require("./routes/deliverers");

/**
 * Serveur principal de l'application backend
 * @notice Point d'entrée principal qui initialise Express, Socket.io et toutes les connexions
 * @dev Gère les middlewares globaux, routes, erreurs et notifications temps réel
 */

// TODO: Créer l'application Express
// const app = express();

// TODO: Créer le serveur HTTP
// const server = http.createServer(app);

// TODO: Initialiser Socket.io avec CORS configuré
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || "http://localhost:3001",
//     methods: ["GET", "POST"],
//     credentials: true
//   }
// });

// TODO: Récupérer le port depuis les variables d'environnement
// const PORT = process.env.PORT || 3000;
// const NODE_ENV = process.env.NODE_ENV || "development";

// === MIDDLEWARES GLOBAUX ===

// TODO: Middleware CORS pour autoriser les requêtes cross-origin
// app.use(cors({
//   origin: process.env.FRONTEND_URL || "http://localhost:3001",
//   credentials: true
// }));

// TODO: Middleware Helmet pour la sécurité HTTP
// app.use(helmet());

// TODO: Middleware Morgan pour le logging des requêtes HTTP
// if (NODE_ENV === "development") {
//   app.use(morgan("dev"));
// } else {
//   app.use(morgan("combined"));
// }

// TODO: Middleware pour parser le body JSON
// app.use(express.json({ limit: "10mb" }));

// TODO: Middleware pour parser les URL encodées
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// === ROUTE HEALTH CHECK ===

// TODO: Route de santé pour vérifier que le serveur fonctionne
// app.get("/health", (req, res) => {
//   res.status(200).json({
//     status: "OK",
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime()
//   });
// });

// TODO: Route API info
// app.get("/api", (req, res) => {
//   res.status(200).json({
//     name: "Done Food Delivery API",
//     version: "1.0.0",
//     description: "API Backend pour la plateforme de livraison de nourriture décentralisée",
//     endpoints: {
//       orders: "/api/orders",
//       users: "/api/users",
//       restaurants: "/api/restaurants",
//       deliverers: "/api/deliverers"
//     }
//   });
// });

// === CONNEXIONS AUX SERVICES EXTERNES ===

/**
 * Initialise toutes les connexions aux services externes
 * @dev TODO: Implémenter la fonction initializeConnections
 */
async function initializeConnections() {
  try {
    // TODO: Établir la connexion MongoDB
    // console.log("Connecting to MongoDB...");
    // await connectDB();
    // console.log("✅ MongoDB connected");

    // TODO: Initialiser la connexion blockchain
    // console.log("Initializing blockchain connection...");
    // await initBlockchain();
    // console.log("✅ Blockchain connected");

    // TODO: Initialiser IPFS
    // console.log("Initializing IPFS...");
    // await initIPFS();
    // console.log("✅ IPFS initialized");

    // TODO: Initialiser le service de notifications avec Socket.io
    // notificationService.initNotificationService(io);
    // console.log("✅ Notification service initialized");

    // TODO: Démarrer l'écoute des events blockchain
    // await blockchainService.listenEvents();
    // console.log("✅ Blockchain events listener started");

    // TODO: Configurer les rooms Socket.io pour les notifications
    // io.on("connection", (socket) => {
    //   console.log(`Client connected: ${socket.id}`);
    //   
    //   // TODO: Rejoindre la room client
    //   socket.on("join-client-room", (address) => {
    //     socket.join(`client_${address.toLowerCase()}`);
    //     console.log(`Client ${address} joined room`);
    //   });
    //   
    //   // TODO: Rejoindre la room restaurant
    //   socket.on("join-restaurant-room", (restaurantId) => {
    //     socket.join(`restaurant_${restaurantId}`);
    //     console.log(`Restaurant ${restaurantId} joined room`);
    //   });
    //   
    //   // TODO: Rejoindre la room deliverer
    //   socket.on("join-deliverer-room", (address) => {
    //     socket.join(`deliverer_${address.toLowerCase()}`);
    //     console.log(`Deliverer ${address} joined room`);
    //   });
    //   
    //   // TODO: Rejoindre la room arbitrators
    //   socket.on("join-arbitrators-room", () => {
    //     socket.join("arbitrators");
    //     console.log(`Arbitrator joined room`);
    //   });
    //   
    //   // TODO: Gérer la déconnexion
    //   socket.on("disconnect", () => {
    //     console.log(`Client disconnected: ${socket.id}`);
    //   });
    // });

  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error initializing connections:", error);
    // throw error;
  }
}

// === ROUTES API ===

// TODO: Monter les routes API
// app.use("/api/orders", orderRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/restaurants", restaurantRoutes);
// app.use("/api/deliverers", delivererRoutes);

// === GESTION DES ERREURS ===

// TODO: Middleware pour gérer les routes non trouvées (404)
// app.use((req, res, next) => {
//   res.status(404).json({
//     error: "Not Found",
//     message: `Route ${req.method} ${req.path} not found`
//   });
// });

// TODO: Middleware global de gestion d'erreurs
// app.use((err, req, res, next) => {
//   console.error("Error:", err);
//   
//   // TODO: Déterminer le code de statut
//   const statusCode = err.statusCode || 500;
//   
//   // TODO: Retourner l'erreur (masquer les détails en production)
//   res.status(statusCode).json({
//     error: err.message || "Internal Server Error",
//     ...(NODE_ENV === "development" && { stack: err.stack })
//   });
// });

// === DÉMARRAGE DU SERVEUR ===

/**
 * Démarre le serveur HTTP
 * @dev TODO: Implémenter la fonction startServer
 */
async function startServer() {
  try {
    // TODO: Initialiser toutes les connexions
    // await initializeConnections();

    // TODO: Démarrer le serveur HTTP
    // server.listen(PORT, () => {
    //   console.log(`🚀 Server running on port ${PORT}`);
    //   console.log(`📡 Environment: ${NODE_ENV}`);
    //   console.log(`🌐 API: http://localhost:${PORT}/api`);
    //   console.log(`🔌 Socket.io: http://localhost:${PORT}`);
    // });

  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Failed to start server:", error);
    // process.exit(1);
  }
}

// === GESTION DU SHUTDOWN ===

/**
 * Gère l'arrêt propre du serveur
 * @dev TODO: Implémenter la fonction gracefulShutdown
 */
async function gracefulShutdown(signal) {
  // TODO: Logger le signal
  // console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    // TODO: Fermer le serveur HTTP
    // server.close(() => {
    //   console.log("HTTP server closed");
    // });

    // TODO: Fermer la connexion MongoDB
    // await disconnectDB();
    // console.log("MongoDB connection closed");

    // TODO: Fermer Socket.io
    // io.close(() => {
    //   console.log("Socket.io server closed");
    // });

    // TODO: Exit proprement
    // process.exit(0);
  } catch (error) {
    // TODO: Logger l'erreur
    // console.error("Error during shutdown:", error);
    // process.exit(1);
  }
}

// TODO: Écouter les signaux de shutdown
// process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
// process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// TODO: Gérer les erreurs non capturées
// process.on("unhandledRejection", (reason, promise) => {
//   console.error("Unhandled Rejection at:", promise, "reason:", reason);
//   gracefulShutdown("unhandledRejection");
// });

// process.on("uncaughtException", (error) => {
//   console.error("Uncaught Exception:", error);
//   gracefulShutdown("uncaughtException");
// });

// TODO: Démarrer le serveur
// startServer();

// TODO: Exporter app et io pour les tests
// module.exports = { app, server, io };

