// Simple logger utility for production-ready error handling
const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  static error(message, error = null) {
    if (isDevelopment) {
      console.error(message, error);
    }
    // In production, you would send this to a logging service
    // Example: Sentry, LogRocket, etc.
  }

  static warn(message, data = null) {
    if (isDevelopment) {
      console.warn(message, data);
    }
    // In production, you would send this to a logging service
  }

  static info(message, data = null) {
    if (isDevelopment) {
      console.log(message, data);
    }
  }

  static debug(message, data = null) {
    if (isDevelopment) {
      console.debug(message, data);
    }
  }
}

export default Logger;
