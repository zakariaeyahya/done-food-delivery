const rateLimit = require('express-rate-limit');

let totalRequests = 0;
let blockedRequests = 0;

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    blockedRequests++;

    res.status(429).json({
      error: 'Too many requests',
      retryAfter: '60 seconds'
    });
  },
  skip: (req) => {
    totalRequests++;
    return false;
  }
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true
});

const userLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  keyGenerator: (req) => {
    return req.user?.id || req.userAddress || req.ip;
  }
});

function getPerformanceMetrics() {
  const currentTime = Date.now();
  const requestsPerSecond = totalRequests / 60;
  const blockRate = totalRequests > 0 ? (blockedRequests / totalRequests * 100).toFixed(2) : 0;

  return {
    totalRequests: totalRequests,
    blockedRequests: blockedRequests,
    requestsPerMinute: totalRequests,
    requestsPerSecond: requestsPerSecond.toFixed(2),
    blockRate: `${blockRate}%`,
    timestamp: currentTime
  };
}

setInterval(() => {
  totalRequests = 0;
  blockedRequests = 0;
}, 60000);

module.exports = {
  apiLimiter,
  authLimiter,
  userLimiter,
  getPerformanceMetrics
};
