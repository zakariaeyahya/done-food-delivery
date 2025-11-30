/**
 * Rate Limit Middleware - Protection contre abus et DDoS
 *
 * Responsabilités :
 * - Limiter le nombre de requêtes par IP
 * - Limiter le nombre de requêtes par utilisateur authentifié
 * - Bloquer temporairement les IPs abusives
 * - Logger les tentatives d'abus
 *
 * Limites par défaut :
 * - IP anonyme : 100 requêtes / minute
 * - Utilisateur authentifié : 1000 requêtes / minute
 * - Endpoints sensibles (login, register) : 5 requêtes / minute
 *
 * Stratégie :
 * - Sliding window algorithm
 * - Stockage en Redis (si disponible) ou en mémoire
 * - Headers de réponse : X-RateLimit-Limit, X-RateLimit-Remaining
 *
 * Utilisation dans server.js :
 * const rateLimit = require('./middleware/rateLimit');
 * app.use('/api', rateLimit.apiLimiter);
 * app.use('/api/auth', rateLimit.authLimiter);
 *
 * Configuration :
 * const apiLimiter = rateLimit({
 *   windowMs: 60 * 1000, // 1 minute
 *   max: 100, // 100 requêtes par minute
 *   message: 'Too many requests, please try again later'
 * });
 *
 * Dépendances :
 * - express-rate-limit (package npm)
 * - Redis (optionnel, pour stockage distribué)
 *
 * Référence :
 * - ARCHITECTURE.md - Section "Vitesse de Transfert / Bande passante API"
 */

/**
 * ========================================
 * PSEUDO-CODE - MESURE DE PERFORMANCE
 * ========================================
 *
 * const rateLimit = require('express-rate-limit');
 *
 * // MÉTRIQUES DE PERFORMANCE GLOBALES
 * let totalRequests = 0;
 * let blockedRequests = 0;
 *
 * // 1. API Limiter général (100 req/min par IP)
 * const apiLimiter = rateLimit({
 *   windowMs: 60 * 1000, // 1 minute
 *   max: 100, // 100 requêtes par minute
 *   message: 'Too many requests from this IP, please try again later',
 *   standardHeaders: true, // Return rate limit info in headers
 *   legacyHeaders: false,
 *   handler: (req, res) => {
 *     // MESURE BLOCAGES
 *     blockedRequests++;
 *     console.warn(`⚠️ Rate limit exceeded: ${req.ip} - ${req.url}`);
 *
 *     res.status(429).json({
 *       error: 'Too many requests',
 *       retryAfter: '60 seconds'
 *     });
 *   },
 *   skip: (req) => {
 *     // Compter toutes les requêtes (MESURE DÉBIT)
 *     totalRequests++;
 *     return false;
 *   }
 * });
 *
 * // 2. Auth Limiter strict (5 req/min pour login/register)
 * const authLimiter = rateLimit({
 *   windowMs: 60 * 1000, // 1 minute
 *   max: 5, // 5 requêtes par minute
 *   message: 'Too many authentication attempts, please try again later',
 *   skipSuccessfulRequests: true // Ne compte que les échecs
 * });
 *
 * // 3. User Limiter pour utilisateurs authentifiés (1000 req/min)
 * const userLimiter = rateLimit({
 *   windowMs: 60 * 1000,
 *   max: 1000,
 *   keyGenerator: (req) => {
 *     // Rate limit par userId au lieu de IP
 *     return req.user?.id || req.ip;
 *   }
 * });
 *
 * // MÉTHODE POUR RÉCUPÉRER MÉTRIQUES
 * function getPerformanceMetrics() {
 *   const currentTime = Date.now();
 *   const requestsPerSecond = totalRequests / 60; // Approximation sur 1 minute
 *   const blockRate = totalRequests > 0 ? (blockedRequests / totalRequests * 100).toFixed(2) : 0;
 *
 *   return {
 *     totalRequests: totalRequests,
 *     blockedRequests: blockedRequests,
 *     requestsPerMinute: totalRequests,
 *     requestsPerSecond: requestsPerSecond.toFixed(2),
 *     blockRate: `${blockRate}%`,
 *     timestamp: currentTime
 *   };
 * }
 *
 * // Reset métriques toutes les minutes
 * setInterval(() => {
 *   console.log('📊 Rate Limit Metrics:', getPerformanceMetrics());
 *   totalRequests = 0;
 *   blockedRequests = 0;
 * }, 60000);
 *
 * module.exports = {
 *   apiLimiter,
 *   authLimiter,
 *   userLimiter,
 *   getPerformanceMetrics
 * };
 */

// TODO: Implémenter avec express-rate-limit
// TODO: Créer apiLimiter (100 req/min par IP)
// TODO: Créer authLimiter (5 req/min pour login/register)
// TODO: Créer userLimiter (1000 req/min par user authentifié)
// TODO: (Optionnel) Utiliser Redis pour distributed rate limiting
