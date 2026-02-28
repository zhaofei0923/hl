const getTimestamp = () => {
  return new Date().toISOString();
};

const formatMessage = (level, args) => {
  const timestamp = getTimestamp();
  const message = args.map(arg => {
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');
  return `[${timestamp}] [${level}] ${message}`;
};

const logger = {
  info(...args) {
    console.log(formatMessage('INFO', args));
  },

  warn(...args) {
    console.warn(formatMessage('WARN', args));
  },

  error(...args) {
    console.error(formatMessage('ERROR', args));
  },

  debug(...args) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatMessage('DEBUG', args));
    }
  }
};

module.exports = logger;
