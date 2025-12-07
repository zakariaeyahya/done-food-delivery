/**
 * Circuit Breaker Utility - Pattern pour isolation des services défaillants
 *
 * Responsabilités :
 * - Protéger l'application contre les services externes défaillants
 * - Éviter la propagation des pannes
 * - Permettre la récupération automatique après panne
 *
 * États du Circuit Breaker :
 * - CLOSED : Normal, toutes les requêtes passent
 * - OPEN : Service défaillant, requêtes rejetées immédiatement
 * - HALF_OPEN : Test de récupération, 1 requête autorisée
 *
 * Fonctionnement :
 * 1. CLOSED → Si N échecs consécutifs → OPEN
 * 2. OPEN → Après timeout (60s) → HALF_OPEN
 * 3. HALF_OPEN → Si succès → CLOSED, sinon → OPEN
 *
 * Utilisation :
 * const CircuitBreaker = require('./utils/circuitBreaker');
 * const ipfsService = require('./services/ipfsService');
 *
 * const ipfsBreaker = new CircuitBreaker(
 *   ipfsService.uploadFile.bind(ipfsService),
 *   5,    // threshold: 5 échecs → OPEN
 *   60000 // timeout: 60 secondes avant retry
 * );
 *
 * try {
 *   const hash = await ipfsBreaker.call(fileBuffer);
 * } catch (error) {
 *   console.error('Circuit breaker OPEN:', error);
 *   // Fallback logic
 * }
 *
 * Cas d'usage :
 * - IPFS uploads (si Pinata down, éviter de spammer)
 * - Appels API externes (CoinGecko, OpenWeatherMap)
 * - Chainlink oracles (si RPC défaillant)
 *
 * Référence :
 * - infrastructure/README.md - Section "Circuit Breaker Pattern"
 * - Pattern documentation: https://martinfowler.com/bliki/CircuitBreaker.html
 */

// États du Circuit Breaker
const STATE = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

/**
 * Classe CircuitBreaker pour isoler les services défaillants
 */
class CircuitBreaker {
  /**
   * @param {Function} fn - Fonction à protéger (doit retourner une Promise)
   * @param {number} failureThreshold - Nombre d'échecs consécutifs avant OPEN (défaut: 5)
   * @param {number} timeout - Délai en ms avant de passer en HALF_OPEN (défaut: 60000)
   */
  constructor(fn, failureThreshold = 5, timeout = 60000) {
    if (typeof fn !== 'function') {
      throw new Error('CircuitBreaker: fn must be a function');
    }
    if (failureThreshold < 1) {
      throw new Error('CircuitBreaker: failureThreshold must be >= 1');
    }
    if (timeout < 0) {
      throw new Error('CircuitBreaker: timeout must be >= 0');
    }

    this.fn = fn;
    this.failureThreshold = failureThreshold;
    this.timeout = timeout;

    // État actuel
    this.state = STATE.CLOSED;

    // Compteurs
    this.failureCount = 0;
    this.successCount = 0;

    // Timestamp de la dernière transition vers OPEN
    this.lastFailureTime = null;

    // Flag pour HALF_OPEN (une seule requête à la fois)
    this.halfOpenCallInProgress = false;
  }

  /**
   * Appelle la fonction protégée avec gestion du circuit breaker
   * @param {...any} args - Arguments à passer à la fonction
   * @returns {Promise<any>} Résultat de la fonction
   * @throws {Error} Si le circuit est OPEN ou si la fonction échoue
   */
  async call(...args) {
    // Vérifier l'état actuel
    if (this.state === STATE.OPEN) {
      // Vérifier si on peut passer en HALF_OPEN
      if (this.lastFailureTime && (Date.now() - this.lastFailureTime) >= this.timeout) {
        this.state = STATE.HALF_OPEN;
        this.halfOpenCallInProgress = false;
        console.log(`[CircuitBreaker] Transition: OPEN → HALF_OPEN`);
      } else {
        // Circuit toujours ouvert, rejeter immédiatement
        const remainingTime = this.timeout - (Date.now() - this.lastFailureTime);
        throw new Error(
          `CircuitBreaker is OPEN. Retry after ${Math.ceil(remainingTime / 1000)}s`
        );
      }
    }

    // Si HALF_OPEN et qu'une requête est déjà en cours, rejeter
    if (this.state === STATE.HALF_OPEN && this.halfOpenCallInProgress) {
      throw new Error('CircuitBreaker is HALF_OPEN: test call already in progress');
    }

    // Marquer qu'une requête est en cours si HALF_OPEN
    if (this.state === STATE.HALF_OPEN) {
      this.halfOpenCallInProgress = true;
    }

    try {
      // Appeler la fonction
      const result = await this.fn(...args);
      
      // Succès
      this.onSuccess();
      return result;
    } catch (error) {
      // Échec
      this.onFailure();
      throw error;
    }
  }

  /**
   * Gère un succès
   */
  onSuccess() {
    if (this.state === STATE.HALF_OPEN) {
      // Succès en HALF_OPEN → revenir à CLOSED
      this.state = STATE.CLOSED;
      this.failureCount = 0;
      this.successCount = 0;
      this.halfOpenCallInProgress = false;
      console.log(`[CircuitBreaker] Transition: HALF_OPEN → CLOSED (recovered)`);
    } else if (this.state === STATE.CLOSED) {
      // Succès en CLOSED → réinitialiser le compteur d'échecs
      this.failureCount = 0;
      this.successCount++;
    }
  }

  /**
   * Gère un échec
   */
  onFailure() {
    if (this.state === STATE.HALF_OPEN) {
      // Échec en HALF_OPEN → retourner à OPEN
      this.state = STATE.OPEN;
      this.lastFailureTime = Date.now();
      this.failureCount = this.failureThreshold;
      this.halfOpenCallInProgress = false;
      console.log(`[CircuitBreaker] Transition: HALF_OPEN → OPEN (test failed)`);
    } else if (this.state === STATE.CLOSED) {
      // Échec en CLOSED → incrémenter le compteur
      this.failureCount++;
      
      // Si on atteint le seuil, ouvrir le circuit
      if (this.failureCount >= this.failureThreshold) {
        this.state = STATE.OPEN;
        this.lastFailureTime = Date.now();
        console.log(
          `[CircuitBreaker] Transition: CLOSED → OPEN (${this.failureCount} failures)`
        );
      }
    }
  }

  /**
   * Retourne l'état actuel du circuit breaker
   * @returns {string} État actuel (CLOSED, OPEN, ou HALF_OPEN)
   */
  getState() {
    return this.state;
  }

  /**
   * Retourne les statistiques du circuit breaker
   * @returns {Object} Statistiques (state, failureCount, successCount, etc.)
   */
  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      timeUntilRetry: this.state === STATE.OPEN && this.lastFailureTime
        ? Math.max(0, this.timeout - (Date.now() - this.lastFailureTime))
        : null
    };
  }

  /**
   * Réinitialise le circuit breaker (force CLOSED)
   * Utile pour les tests ou la récupération manuelle
   */
  reset() {
    this.state = STATE.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.halfOpenCallInProgress = false;
    console.log(`[CircuitBreaker] Manually reset to CLOSED`);
  }
}

module.exports = CircuitBreaker;
