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

// TODO: Implémenter avec express-rate-limit
// TODO: Créer apiLimiter (100 req/min par IP)
// TODO: Créer authLimiter (5 req/min pour login/register)
// TODO: Créer userLimiter (1000 req/min par user authentifié)
// TODO: (Optionnel) Utiliser Redis pour distributed rate limiting
