require("dotenv").config();

const logger = require("./utils/logger");

const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { connectDB, disconnectDB } = require("./config/database");
const { initBlockchain } = require("./config/blockchain");
const { initIPFS } = require("./config/ipfs");

const notificationService = require("./services/notificationService");
const blockchainService = require("./services/blockchainService");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const restaurantRoutes = require("./routes/restaurants");
const delivererRoutes = require("./routes/deliverers");
const adminRoutes = require("./routes/admin");
const analyticsRoutes = require("./routes/analytics");
const oracleRoutes = require("./routes/oracles");
const disputeRoutes = require("./routes/disputes");
const tokenRoutes = require("./routes/tokens");
const uploadRoutes = require("./routes/upload");
const cartRoutes = require("./routes/cart");
const reviewRoutes = require("./routes/reviews");
const blockchainRoutes = require("./routes/blockchain");

/**
 * Serveur principal de l'application backend
 * @notice Point d'entrée principal qui initialise Express, Socket.io et toutes les connexions
 * @dev Gère les middlewares globaux, routes, erreurs et notifications temps réel
 */

const app = express();

const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:3001",  // Next.js deliverer frontend
  "http://localhost:3002",
  "http://localhost:3003",
  process.env.FRONTEND_URL
].filter(Boolean);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-address', 'x-wallet-address', 'x-message', 'x-address'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(helmet());
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    name: "Done Food Delivery API",
    version: "1.0.0",
    description: "API Backend pour la plateforme de livraison de nourriture décentralisée",
    endpoints: {
      orders: "/api/orders",
      users: "/api/users",
      restaurants: "/api/restaurants",
      deliverers: "/api/deliverers"
    }
  });
});

app.get("/api/ping", (req, res) => {
  res.status(200).json({
    success: true,
    message: "pong",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/config", (req, res) => {
  res.status(200).json({
    success: true,
    contracts: {
      orderManager: process.env.ORDER_MANAGER_ADDRESS || null,
      token: process.env.TOKEN_ADDRESS || null,
      staking: process.env.STAKING_ADDRESS || null,
      paymentSplitter: process.env.PAYMENT_SPLITTER_ADDRESS || null
    },
    network: {
      chainId: 80002,
      name: "Polygon Amoy Testnet",
      rpcUrl: "https://rpc-amoy.polygon.technology"
    }
  });
});

/**
 * Initialise toutes les connexions aux services externes
 */
async function initializeConnections() {
  try {
    await connectDB();

    try {
      await initBlockchain();

      await blockchainService.listenEvents();
    } catch (blockchainError) {
    }

    await initIPFS();

    notificationService.initNotificationService(io);

    io.on("connection", (socket) => {

      socket.on("join-client-room", (address) => {
        socket.join(`client_${address.toLowerCase()}`);
      });

      socket.on("join-restaurant-room", (restaurantId) => {
        socket.join(`restaurant_${restaurantId}`);
      });

      socket.on("join-deliverer-room", (address) => {
        socket.join(`deliverer_${address.toLowerCase()}`);
      });

      socket.on("join-arbitrators-room", () => {
        socket.join("arbitrators");
      });

      socket.on("disconnect", () => {
      });
    });

  } catch (error) {
    throw error;
  }
}

app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/deliverers", delivererRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/oracles", oracleRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/blockchain", blockchainRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    ...(NODE_ENV === "development" && { stack: err.stack })
  });
});

/**
 * Démarre le serveur HTTP
 */
async function startServer() {
  try {
    await initializeConnections();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${NODE_ENV}`);
    });

  } catch (error) {
    process.exit(1);
  }
}

/**
 * Gère l'arrêt propre du serveur
 */
async function gracefulShutdown(signal) {
  try {
    server.close(() => {
    });

    await disconnectDB();

    io.close(() => {
    });

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  if (reason && typeof reason === 'object') {
    const error = reason;

    const isFilterNotFoundError =
      (error.code === 'UNKNOWN_ERROR' &&
       error.error &&
       error.error.message === 'filter not found') ||
      (error.message && error.message.includes('filter not found')) ||
      (error.shortMessage && error.shortMessage.includes('filter not found'));

    if (isFilterNotFoundError) {
      return;
    }
  }

  gracefulShutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  gracefulShutdown("uncaughtException");
});

if (require.main === module) {
  startServer();
}

module.exports = { app, server, io, startServer };

