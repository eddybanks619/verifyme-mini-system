const { getChannel, VERIFICATION_QUEUE } = require('../config/rabbitmq');
const VerificationService = require('../modules/verification/service/verification.service');
const VerificationLog = require('../models/verification-log.model');
const billingService = require('../modules/billing/service/billing.service');

const MAX_RETRIES = 3;

const startWorker = () => {
  const channel = getChannel();
  if (!channel) {
    console.error('RabbitMQ channel not available. Worker cannot start.');
    setTimeout(startWorker, 5000);
    return;
  }

  console.log('Verification worker started. Waiting for jobs...');

  channel.consume(VERIFICATION_QUEUE, async (msg) => {
    if (msg !== null) {
      const jobData = JSON.parse(msg.content.toString());
      const { logId, type, clientOrganizationId} = jobData;

      try {
        await VerificationLog.findByIdAndUpdate(logId, { status: 'PROCESSING' });
        await VerificationService.processVerificationJob(jobData);
        channel.ack(msg);
        console.log(`Job ${logId} processed successfully.`);
      } catch (error) {
        console.error(`Error processing job ${logId}:`, error.message);

        const log = await VerificationLog.findById(logId);
        const currentRetries = log.retryCount || 0;

        if (currentRetries < MAX_RETRIES) {

          await VerificationLog.findByIdAndUpdate(logId, { 
            status: 'PENDING', 
            retryCount: currentRetries + 1,
            errorMessage: `Processing failed. Retrying... (${error.message})`
          });
          channel.nack(msg, false, false);
        } else {
          await VerificationLog.findByIdAndUpdate(logId, {
            status: 'FAILED',
            errorMessage: `Verification failed after ${MAX_RETRIES} retries: ${error.message}`,
            completedAt: new Date(),
          });
          await billingService.refundWallet(clientOrganizationId, type.toUpperCase(), `refund_failed_${logId}`);
          channel.ack(msg);
          console.log(`Job ${logId} failed permanently and was refunded.`);
        }
      }
    }
  }, { noAck: false });
};

module.exports = { startWorker };