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
const { publishToQueue } = require('../../../config/rabbitmq');
const crypto = require('crypto');

const CACHE_TTL_SECONDS = 3600;

class VerificationService {

  async createVerificationJob(jobDetails) {
    const { type, id, mode, purpose, clientOrganization, idempotencyKey } = jobDetails;

    if (idempotencyKey) {
      const existingLog = await VerificationLog.findOne({ idempotencyKey });
      if (existingLog) {
        return { isDuplicate: true, job: existingLog };
      }
    }

    const verificationLog = await VerificationLog.create({
      verificationType: type,
      searchId: id,
      status: 'PENDING',
      clientOrganizationId: clientOrganization._id,
      idempotencyKey: idempotencyKey,
    });

    const jobData = {
      logId: verificationLog._id,
      type,
      id,
      mode,
      purpose,
      clientOrganizationId: clientOrganization._id.toString(),
      idempotencyKey,
    };
    publishToQueue(jobData);

    return { isDuplicate: false, job: verificationLog };
  }

  async getJobStatus(logId, clientOrganization) {
    const verification = await VerificationLog.findById(logId);

    if (!verification) {
      throw new AppError('Verification record not found.', 404, 'NOT_FOUND');
    }


    if (verification.clientOrganizationId.toString() !== clientOrganization._id.toString()) {
      throw new AppError('You are not authorized to view this verification record.', 403, 'FORBIDDEN');
    }


    return {
      status: verification.status,
      verificationId: verification._id,
      data: verification.status === 'COMPLETED' ? verification.responsePayload : null,
      error: verification.status === 'FAILED' ? verification.errorMessage : null,
      createdAt: verification.createdAt,
      completedAt: verification.completedAt,
    };
  }

  async processVerificationJob(jobData) {
    const { logId, type, id, mode, purpose, clientOrganizationId, idempotencyKey } = jobData;

    const cacheKey = this.generateCacheKey(type, id, mode);
    try {
      const cachedResult = await redisClient.get(cacheKey);
      if (cachedResult) {
        console.log(`[CACHE HIT] for key: ${cacheKey}`);

        console.incrementMetric('hits');
        await this.updateLog(logId, 'COMPLETED', JSON.parse(cachedResult));
        return;
      }og(`[CACHE MISS] for key: ${cacheKey}`);
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
      // No refund needed as charge failed
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
        // Refund the client
        await billingService.refundWallet(clientOrganizationId, type.toUpperCase(), `refund_${logId}`);
        return;
      }

      const normalizedData = await normalizer.normalize(type.toUpperCase(), rawData);

      // 4. Store in cache
      try {
        await redisClient.set(cacheKey, JSON.stringify(normalizedData), { EX: CACHE_TTL_SECONDS });
      } catch (redisError) {
        console.error('Redis SET error (graceful degradation):', redisError);
      }

      // 5. Update log to COMPLETED
      await this.updateLog(logId, 'COMPLETED', normalizedData);

    } catch (error) {
      // This catches errors from the provider call (e.g., network issues)
      console.error(`Verification job ${logId} failed:`, error.message);
      throw error; // Throw to trigger retry logic in the worker
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