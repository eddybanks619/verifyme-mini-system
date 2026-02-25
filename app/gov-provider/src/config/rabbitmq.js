const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL
const GOV_VERIFICATION_QUEUE = 'gov_verification_queue';

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertQueue(GOV_VERIFICATION_QUEUE, { durable: true });

    console.log('Connected to RabbitMQ (Gov Provider).');
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    setTimeout(connectRabbitMQ, 5000);
  }
};

const publishToQueue = (data) => {
  if (!channel) {
    console.error('RabbitMQ channel is not available.');
    return;
  }
  channel.sendToQueue(GOV_VERIFICATION_QUEUE, Buffer.from(JSON.stringify(data)), { persistent: true });
};

module.exports = {
  connectRabbitMQ,
  publishToQueue,
  getChannel: () => channel,
  GOV_VERIFICATION_QUEUE,
};