/**
 * Performance Monitoring Middleware - Surveillance temps de réponse API
 *
 * Responsabilités :
 * - Mesurer le temps de réponse de chaque requête API
 * - Logger les requêtes lentes (> 1 seconde)
 * - Envoyer des alertes si temps de réponse > threshold
 * - Collecter métriques pour analytics
 *
 * Métriques collectées :
 * - Temps de réponse (ms)
 * - URL endpoint
 * - Méthode HTTP (GET, POST, etc.)
 * - Status code (200, 400, 500, etc.)
 * - User agent
 *
 * Thresholds :
 * - Normal : < 200ms
 * - Warning : 200-1000ms
 * - Critical : > 1000ms → Alerte envoyée
 *
 * Utilisation dans server.js :
 * const performanceMonitoring = require('./middleware/performanceMonitoring');
 * app.use(performanceMonitoring);
 *
 * Dépendances :
 * - response-time (package npm)
 * - alertService (pour alertes si lent)
 *
 * Output console :
 * GET /api/orders/123 - 45.23ms ✓
 * POST /api/orders/create - 1234.56ms ⚠️ SLOW
 *
 * Référence :
 * - ARCHITECTURE.md - Section "Mesures de Performance / Latence"
 * - infrastructure/README.md - Section "Performance Monitoring"
 */

/**
 * ========================================
 * PSEUDO-CODE - MESURE DE PERFORMANCE
 * ========================================
 *
 * const responseTime = require('response-time');
 * const alertService = require('../services/alertService');
 *
 * const THRESHOLD_MS = 1000; // 1 seconde
 *
 * const performanceMonitoring = responseTime((req, res, time) => {
 *   // 1. Mesurer temps de réponse
 *   const responseTimeMs = time;
 *   const url = req.url;
 *   const method = req.method;
 *   const statusCode = res.statusCode;
 *
 *   // 2. Logger dans console
 *   if (responseTimeMs > THRESHOLD_MS) {
 *     console.warn(`⚠️ SLOW: ${method} ${url} - ${responseTimeMs.toFixed(2)}ms`);
 *
 *     // 3. Envoyer alerte si critique
 *     alertService.sendAlert('WARNING', 'Slow API Response', {
 *       url: url,
 *       method: method,
 *       responseTime: `${responseTimeMs}ms`,
 *       threshold: `${THRESHOLD_MS}ms`,
 *       statusCode: statusCode
 *     });
 *   } else {
 *     console.log(`✓ ${method} ${url} - ${responseTimeMs.toFixed(2)}ms`);
 *   }
 *
 *   // 4. (Optionnel) Stocker métriques dans MongoDB
 *   // PerformanceMetric.create({
 *   //   url, method, responseTime: responseTimeMs, statusCode, timestamp: Date.now()
 *   // });
 * });
 *
 * module.exports = performanceMonitoring;
 */

// TODO: Implémenter avec response-time middleware
// TODO: Logger toutes les requêtes avec leur temps de réponse
// TODO: Send alert si temps > 1000ms
// TODO: (Optionnel) Stocker métriques dans MongoDB pour analytics
