const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const VERIFICATION_QUEUE = 'verification_queue';
const DEAD_LETTER_EXCHANGE = 'verification_dlx';
const DEAD_LETTER_QUEUE = 'verification_dlq';

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(DEAD_LETTER_EXCHANGE, 'direct', { durable: true });
    await channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });
    await channel.bindQueue(DEAD_LETTER_QUEUE, DEAD_LETTER_EXCHANGE, '');


    await channel.assertQueue(VERIFICATION_QUEUE, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': DEAD_LETTER_EXCHANGE,
      },
    });

    console.log('Connected to RabbitMQ and queues are set up.');
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
  channel.sendToQueue(VERIFICATION_QUEUE, Buffer.from(JSON.stringify(data)), { persistent: true });
};

module.exports = {
  connectRabbitMQ,
  publishToQueue,
  getChannel: () => channel,
  VERIFICATION_QUEUE,
};