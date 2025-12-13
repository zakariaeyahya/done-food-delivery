const fs = require('fs');
const path = require('path');

/**
 * Simple Logger - Writes to console and file
 */

const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'server.log');

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Clear log file on startup (optional - comment out to keep history)
fs.writeFileSync(LOG_FILE, `=== Server started at ${new Date().toISOString()} ===\n`);

/**
 * Format log message with timestamp
 */
function formatMessage(level, ...args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  return `[${timestamp}] [${level}] ${message}`;
}

/**
 * Check if message should be filtered (noise/non-critical errors)
 */
function shouldFilter(args) {
  const str = args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');

  // Filter out "filter not found" RPC errors (non-critical)
  if (str.includes('filter not found') ||
      str.includes('eth_getFilterChanges') ||
      str.includes('@TODO')) {
    return true;
  }

  return false;
}

/**
 * Write to log file
 */
function writeToFile(message) {
  fs.appendFileSync(LOG_FILE, message + '\n');
}

/**
 * Logger object with methods for each log level
 */
const logger = {
  info: (...args) => {
    const msg = formatMessage('INFO', ...args);
    console.log(...args);
    writeToFile(msg);
  },

  warn: (...args) => {
    const msg = formatMessage('WARN', ...args);
    console.warn(...args);
    writeToFile(msg);
  },

  error: (...args) => {
    const msg = formatMessage('ERROR', ...args);
    console.error(...args);
    writeToFile(msg);
  },

  debug: (...args) => {
    const msg = formatMessage('DEBUG', ...args);
    if (process.env.DEBUG === 'true') {
      console.log(...args);
    }
    writeToFile(msg);
  },

  // Log blockchain transactions specifically
  blockchain: (...args) => {
    const msg = formatMessage('BLOCKCHAIN', ...args);
    console.log('[BLOCKCHAIN]', ...args);
    writeToFile(msg);
  },

  // Get log file path
  getLogPath: () => LOG_FILE
};

// Override console methods to also write to file (with filtering)
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = (...args) => {
  if (shouldFilter(args)) return; // Skip filtered messages
  originalConsoleLog(...args);
  writeToFile(formatMessage('LOG', ...args));
};

console.warn = (...args) => {
  if (shouldFilter(args)) return; // Skip filtered messages
  originalConsoleWarn(...args);
  writeToFile(formatMessage('WARN', ...args));
};

console.error = (...args) => {
  if (shouldFilter(args)) return; // Skip filtered messages
  originalConsoleError(...args);
  writeToFile(formatMessage('ERROR', ...args));
};

module.exports = logger;
