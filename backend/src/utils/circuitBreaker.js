const STATE = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

class CircuitBreaker {
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

    this.state = STATE.CLOSED;

    this.failureCount = 0;
    this.successCount = 0;

    this.lastFailureTime = null;

    this.halfOpenCallInProgress = false;
  }
  async call(...args) {
    if (this.state === STATE.OPEN) {
      if (this.lastFailureTime && (Date.now() - this.lastFailureTime) >= this.timeout) {
        this.state = STATE.HALF_OPEN;
        this.halfOpenCallInProgress = false;
      } else {
        const remainingTime = this.timeout - (Date.now() - this.lastFailureTime);
        throw new Error(
          `CircuitBreaker is OPEN. Retry after ${Math.ceil(remainingTime / 1000)}s`
        );
      }
    }

    if (this.state === STATE.HALF_OPEN && this.halfOpenCallInProgress) {
      throw new Error('CircuitBreaker is HALF_OPEN: test call already in progress');
    }

    if (this.state === STATE.HALF_OPEN) {
      this.halfOpenCallInProgress = true;
    }

    try {
      const result = await this.fn(...args);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  onSuccess() {
    if (this.state === STATE.HALF_OPEN) {
      this.state = STATE.CLOSED;
      this.failureCount = 0;
      this.successCount = 0;
      this.halfOpenCallInProgress = false;
    } else if (this.state === STATE.CLOSED) {
      this.failureCount = 0;
      this.successCount++;
    }
  }

  onFailure() {
    if (this.state === STATE.HALF_OPEN) {
      this.state = STATE.OPEN;
      this.lastFailureTime = Date.now();
      this.failureCount = this.failureThreshold;
      this.halfOpenCallInProgress = false;
    } else if (this.state === STATE.CLOSED) {
      this.failureCount++;

      if (this.failureCount >= this.failureThreshold) {
        this.state = STATE.OPEN;
        this.lastFailureTime = Date.now();
      }
    }
  }
  getState() {
    return this.state;
  }

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

  reset() {
    this.state = STATE.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.halfOpenCallInProgress = false;
  }
}

module.exports = CircuitBreaker;
