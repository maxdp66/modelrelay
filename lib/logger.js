import pino from 'pino';

const USE_CONSOLE = process.env.USE_CONSOLE === '1';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_FILE = process.env.LOG_FILE;

// When using pino in production, output JSON to stdout (fd 1)
// In development, use pino-pretty for human-readable logs
function createLogger() {
  if (USE_CONSOLE) {
    return {
      info: (...args) => console.log('[INFO]', ...args),
      warn: (...args) => console.warn('[WARN]', ...args),
      error: (...args) => console.error('[ERROR]', ...args),
      debug: (...args) => console.debug('[DEBUG]', ...args),
      trace: (...args) => console.trace('[TRACE]', ...args),
      child: () => createLogger(),  // no-op child for compatibility
    };
  }

  const transport = process.env.NODE_ENV === 'production'
    ? undefined
    : { target: 'pino-pretty', options: { translateTime: true } };

  const base = {
    level: LOG_LEVEL,
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(LOG_FILE ? {} : { destination: 1 }),  // 1 = stdout
  };

  if (LOG_FILE) {
    return pino(base, pino.destination(LOG_FILE, { sync: false }));
  }

  return pino(base, transport);
}

export const logger = createLogger();

export default logger;
