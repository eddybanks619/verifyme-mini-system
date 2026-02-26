const { getChannel, GOV_QUEUE, publishToRetryQueue } = require('../config/rabbitmq');
const axios = require('axios');
const ninService = require('../modules/nin/service/nin.service');
const bvnService = require('../modules/bvn/service/bvn.service');
const passportService = require('../modules/passport/service/passport.service');
const dlService = require('../modules/drivers-license/service/dl.service');

const MAX_RETRIES = 5;

const startWorker = () => {
  const channel = getChannel();
  if (!channel) {
    console.error('RabbitMQ channel not available. Worker cannot start.');
    setTimeout(startWorker, 5000);
    return;
  }

  console.log('Gov Provider Verification worker started. Waiting for jobs...');

  channel.consume(GOV_QUEUE, async (msg) => {
    if (msg !== null) {
      const jobData = JSON.parse(msg.content.toString());
      const {
        type,
        id,
        mode,
        purpose,
        organizationId,
        idempotencyKey,
        callbackUrl,
        verificationId,
        retryCount = 0,
      } = jobData;
      const resolvedVerificationId = verificationId || idempotencyKey || `${type}:${id}`;

      try {
        let result = null;
        let error = null;

        // // Simulate processing delay (optional, can be removed for production speed)
        // await new Promise(resolve => setTimeout(resolve, 1000));

        try {
          // Construct a mock organization object as expected by the services
          const organization = { _id: organizationId };

          switch (type) {
            case 'NIN':
              result = await ninService.verify(id, mode, purpose, organization, idempotencyKey);
              break;
            case 'BVN':
              result = await bvnService.verify(id, mode, purpose, organization, idempotencyKey);
              break;
            case 'PASSPORT':
              result = await passportService.verify(id, mode, purpose, organization, idempotencyKey);
              break;
            case 'DRIVERS_LICENSE':
              result = await dlService.verify(id, mode, purpose, organization, idempotencyKey);
              break;
            default:
              throw new Error('Invalid verification type');
          }
        } catch (err) {
          console.error(`Verification logic failed for ${resolvedVerificationId}:`, err.message);
          error = err.message;
        }

        // Send Webhook
        if (callbackUrl) {
          try {
            console.log(`Sending webhook to ${callbackUrl} for ${resolvedVerificationId}`);
            await axios.post(callbackUrl, {
              verificationId: resolvedVerificationId,
              status: error ? 'FAILED' : 'COMPLETED',
              data: result ? result.data : null,
              error: error
            }, {
              headers: { 'x-gov-signature': 'simulated-signature' }
            });
            console.log(`Webhook sent successfully for verification ${resolvedVerificationId}`);
            channel.ack(msg); // Acknowledge after successful webhook
          } catch (webhookError) {
            // Webhook call failed, so we need to retry
            console.error(`Failed to send webhook for ${resolvedVerificationId}:`, webhookError.message);
            throw new Error('Webhook delivery failed'); // Throw to trigger retry logic
          }
        } else {
          // No callbackUrl, so just acknowledge the message
          console.warn(`No callbackUrl for job ${resolvedVerificationId}. Acknowledging message.`);
          channel.ack(msg);
        }
      } catch (processingError) {
        // This block now primarily catches webhook delivery failures
        if (retryCount < MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying webhook for ${resolvedVerificationId} in ${delay}ms (Attempt ${retryCount + 1}/${MAX_RETRIES})`);

          // Add retryCount to the job data for the next attempt
          const nextJobData = { ...jobData, retryCount: retryCount + 1 };
          publishToRetryQueue(nextJobData, delay);

          channel.ack(msg); // Ack the original message
        } else {
          console.error(`Webhook for ${resolvedVerificationId} failed permanently after ${MAX_RETRIES} retries.`);
          // Nack to send to DLQ for manual inspection
          channel.nack(msg, false, false);
        }
      }
    }
  }, { noAck: false });
};

module.exports = { startWorker };
