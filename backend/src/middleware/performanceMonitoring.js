const responseTime = require('response-time');
const alertService = require('../services/alertService');

const THRESHOLD_MS = 1000;

const performanceMonitoring = responseTime((req, res, time) => {
  const responseTimeMs = time;
  const url = req.url;
  const method = req.method;
  const statusCode = res.statusCode;

  if (responseTimeMs > THRESHOLD_MS) {
    alertService.sendAlert('WARNING', 'Slow API Response', {
      url: url,
      method: method,
      responseTime: `${responseTimeMs}ms`,
      threshold: `${THRESHOLD_MS}ms`,
      statusCode: statusCode
    }).catch(err => {
    });
  }
});

module.exports = performanceMonitoring;
