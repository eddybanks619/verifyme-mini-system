const ninProvider = require('../../../providers/gov/nin.provider');
const bvnProvider = require('../../../providers/gov/bvn.provider');
const passportProvider = require('../../../providers/gov/passport.provider');
const dlProvider = require('../../../providers/gov/dl.provider');
const normalizer = require('../../../normalizers/identity.normalizer');
const VerificationLog = require('../../../models/verification-log.model');
const billingService = require('../../billing/service/billing.service');
const AppError = require('../../../utils/AppError');
const { redisClient } = require('../../../config/redis');
const { incrementMetric } = require('../../../utils/metrics.util');
const crypto = require('crypto');

const CACHE_TTL_SECONDS = 3600;

class VerificationService {

  async processVerificationJob(jobData) {
    const { logId, type, id, mode, purpose, clientOrganizationId, idempotencyKey } = jobData;

    const cacheKey = this.generateCacheKey(type, id, mode);
    try {
      const cachedResult = await redisClient.get(cacheKey);
      if (cachedResult) {
        console.log(`[CACHE HIT] for key: ${cacheKey}`);
        incrementMetric('hits');
        await this.updateLog(logId, 'COMPLETED', JSON.parse(cachedResult));
        return;
      }
      console.log(`[CACHE MISS] for key: ${cacheKey}`);
      incrementMetric('misses');
    } catch (redisError) {
      console.error('Redis GET error (graceful degradation):', redisError);
      incrementMetric('misses');
    }

    const billingResult = await billingService.chargeWallet(
      clientOrganizationId,
      type.toUpperCase(),
      idempotencyKey
    );

    if (!billingResult.success) {
      await this.updateLog(logId, 'FAILED', null, `Billing failed: ${billingResult.message}`);
      return;
    }

    try {
      let rawData = null;
      switch (type.toUpperCase()) {
        case 'NIN':
          rawData = await ninProvider.verify(id, mode, purpose);
          break;
        case 'BVN':
          rawData = await bvnProvider.verify(id, mode, purpose);
          break;
        case 'PASSPORT':
          rawData = await passportProvider.verify(id, mode, purpose);
          break;
        case 'DRIVERS_LICENSE':
          rawData = await dlProvider.verify(id, mode, purpose);
          break;
        default:
          throw new Error('Invalid verification type');
      }

      if (!rawData) {
        await this.updateLog(logId, 'FAILED', null, 'Identity not found');
        await billingService.refundWallet(clientOrganizationId, type.toUpperCase(), `refund_${logId}`);
        return;
      }

      const normalizedData = await normalizer.normalize(type.toUpperCase(), rawData);

      try {
        await redisClient.set(cacheKey, JSON.stringify(normalizedData), { EX: CACHE_TTL_SECONDS });
      } catch (redisError) {
        console.error('Redis SET error (graceful degradation):', redisError);
      }

      await this.updateLog(logId, 'COMPLETED', normalizedData);

    } catch (error) {
      console.error(`Verification job ${logId} failed:`, error.message);
      throw error;
    }
  }

  generateCacheKey(type, id, mode) {
    const hash = crypto.createHash('sha256').update(`${type}:${id}:${mode}`).digest('hex');
    return `verification:${hash}`;
  }

  async updateLog(logId, status, responsePayload = null, errorMessage = null) {
    try {
      const update = {
        status,
        responsePayload,
        errorMessage,
        completedAt: new Date(),
      };
      if (responsePayload && responsePayload.photo) {
        update.responsePayload.photo = '[BASE64_IMAGE_TRUNCATED]';
      }
      await VerificationLog.findByIdAndUpdate(logId, update);
    } catch (logError) {
      console.error(`Failed to update log ${logId}:`, logError);
    }
  }
}

module.exports = new VerificationService();