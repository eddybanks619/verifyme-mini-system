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
      const { type, id, mode, purpose, organizationId, idempotencyKey, callbackUrl, verificationId, retryCount = 0 } = jobData;

      try {
        let result = null;
        let error = null;

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
          // This is where the actual verification happens.
          // For this simulation, we assume it succeeds and returns data.
          // In a real scenario, this block could also throw an error.
          result = { data: { id, status: 'VERIFIED', name: 'John Doe' } }; // Simulated success data
        } catch (err) {
          error = err.message;
        }

        // Send Webhook
        if (callbackUrl) {
          try {
            await axios.post(callbackUrl, {
              verificationId: verificationId,
              status: error ? 'FAILED' : 'COMPLETED',
              data: result ? result.data : null,
              error: error
            }, {
              headers: { 'x-gov-signature': 'simulated-signature' }
            });
            console.log(`Webhook sent successfully for verification ${verificationId}`);
            channel.ack(msg); // Acknowledge after successful webhook
          } catch (webhookError) {
            // Webhook call failed, so we need to retry
            console.error(`Failed to send webhook for ${verificationId}:`, webhookError.message);
            throw new Error('Webhook delivery failed'); // Throw to trigger retry logic
          }
        } else {
          // No callbackUrl, so just acknowledge the message
          console.warn(`No callbackUrl for job ${verificationId}. Acknowledging message.`);
          channel.ack(msg);
        }
      } catch (processingError) {
        // This block now primarily catches webhook delivery failures
        if (retryCount < MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying webhook for ${verificationId} in ${delay}ms (Attempt ${retryCount + 1}/${MAX_RETRIES})`);

          // Add retryCount to the job data for the next attempt
          const nextJobData = { ...jobData, retryCount: retryCount + 1 };
          publishToRetryQueue(nextJobData, delay);

          channel.ack(msg); // Ack the original message
        } else {
          console.error(`Webhook for ${verificationId} failed permanently after ${MAX_RETRIES} retries.`);
          // Nack to send to DLQ for manual inspection
          channel.nack(msg, false, false);
        }
      }
    }
  }, { noAck: false });
};

module.exports = { startWorker };