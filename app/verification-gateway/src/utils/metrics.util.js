const { redisClient } = require('../config/redis');

const incrementMetric = async (metricType) => {
  try {
    await redisClient.incr(`metrics:cache:${metricType}`);
  } catch (redisError) {
    console.error(`Failed to increment metric ${metricType} (graceful degradation):`, redisError);
  }
};

module.exports = {
  incrementMetric,
};
