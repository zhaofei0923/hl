const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;
let isAvailable = false;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis connection failed after 3 retries, running without Redis');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    maxRetriesPerRequest: 3,
    lazyConnect: true
  });

  redis.on('connect', () => {
    isAvailable = true;
    logger.info('Redis connected successfully');
  });

  redis.on('error', (err) => {
    isAvailable = false;
    logger.warn('Redis connection error:', err.message);
  });

  redis.on('close', () => {
    isAvailable = false;
  });

  redis.connect().catch(() => {
    logger.warn('Redis unavailable, running without cache');
  });
} catch (err) {
  logger.warn('Redis initialization failed:', err.message);
}

const redisClient = {
  async get(key) {
    if (!isAvailable || !redis) return null;
    try {
      return await redis.get(key);
    } catch {
      return null;
    }
  },

  async set(key, value, exSeconds) {
    if (!isAvailable || !redis) return null;
    try {
      if (exSeconds) {
        return await redis.set(key, value, 'EX', exSeconds);
      }
      return await redis.set(key, value);
    } catch {
      return null;
    }
  },

  async del(key) {
    if (!isAvailable || !redis) return null;
    try {
      return await redis.del(key);
    } catch {
      return null;
    }
  },

  async incr(key) {
    if (!isAvailable || !redis) return null;
    try {
      return await redis.incr(key);
    } catch {
      return null;
    }
  },

  async expire(key, seconds) {
    if (!isAvailable || !redis) return null;
    try {
      return await redis.expire(key, seconds);
    } catch {
      return null;
    }
  },

  get available() {
    return isAvailable;
  },

  get client() {
    return redis;
  }
};

module.exports = redisClient;
