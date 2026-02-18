const { redisClient } = require('../config/redis');

/**
 * Increments a specified metric counter in Redis.
 * This function degrades gracefully if Redis is unavailable.
 * @param {string} metricType - The type of metric to increment (e.g., 'hits', 'misses').
 */
const incrementMetric = async (metricType) => {
  try {
    await redisClient.incr(`metrics:cache:${metricType}`); // e.g., metrics:cache:hits
  } catch (redisError) {
    console.error(`Failed to increment metric ${metricType} (graceful degradation):`, redisError);
  }
};

module.exports = {
  incrementMetric,
};
