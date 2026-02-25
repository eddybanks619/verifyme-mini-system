const { getChannel, GOV_VERIFICATION_QUEUE } = require('../config/rabbitmq');
const axios = require('axios');
const ninService = require('../modules/nin/service/nin.service');
const bvnService = require('../modules/bvn/service/bvn.service');
const passportService = require('../modules/passport/service/passport.service');
const dlService = require('../modules/drivers-license/service/dl.service');

const startWorker = () => {
  const channel = getChannel();
  if (!channel) {
    console.error('RabbitMQ channel not available. Worker cannot start.');
    setTimeout(startWorker, 5000);
    return;
  }

  console.log('Gov Provider Verification worker started. Waiting for jobs...');

  channel.consume(GOV_VERIFICATION_QUEUE, async (msg) => {
    if (msg !== null) {
      const jobData = JSON.parse(msg.content.toString());
      const { type, id, mode, purpose, organizationId, idempotencyKey, callbackUrl, verificationId } = jobData;

      try {
        let result = null;
        let error = null;

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
          switch (type) {
            case 'NIN':
              result = await ninService.verify(id, mode, purpose, { _id: organizationId }, idempotencyKey);
              break;
            case 'BVN':
              result = await bvnService.verify(id, mode, purpose, { _id: organizationId }, idempotencyKey);
              break;
            case 'PASSPORT':
              result = await passportService.verify(id, mode, purpose, { _id: organizationId }, idempotencyKey);
              break;
            case 'DRIVERS_LICENSE':
              result = await dlService.verify(id, mode, purpose, { _id: organizationId }, idempotencyKey);
              break;
            default:
              throw new Error('Invalid verification type');
          }
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
              headers: {
                'x-gov-signature': 'simulated-signature'
              }
            });
            console.log(`Webhook sent for ${type} verification ${verificationId}`);
          } catch (webhookError) {
            console.error(`Failed to send webhook for ${verificationId}:`, webhookError.message);
            // In a real system, you'd retry the webhook delivery
          }
        }

        channel.ack(msg);
      } catch (processingError) {
        console.error(`Error processing job ${verificationId}:`, processingError.message);
        // For now, ack to remove from queue, but in real world, handle retries
        channel.ack(msg);
      }
    }
  }, { noAck: false });
};

module.exports = { startWorker };