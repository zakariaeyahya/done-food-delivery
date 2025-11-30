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

// TODO: Implémenter avec response-time middleware
// TODO: Logger toutes les requêtes avec leur temps de réponse
// TODO: Send alert si temps > 1000ms
// TODO: (Optionnel) Stocker métriques dans MongoDB pour analytics
