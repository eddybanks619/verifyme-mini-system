const amqp = require('amqplib');

// Default to the docker service name 'rabbitmq' if env var is not set
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

// Main Exchange & Queue
const VERIFICATION_EXCHANGE = 'verification_exchange';
const VERIFICATION_QUEUE = 'verification_queue';
const VERIFICATION_ROUTING_KEY = 'verification.create';

// Retry Exchange & Queue
const RETRY_EXCHANGE = 'verification_retry_exchange';
const RETRY_QUEUE = 'verification_retry_queue';
const RETRY_ROUTING_KEY = 'verification.retry';

// Dead Letter Exchange & Queue (Final Destination for failed jobs)
const DEAD_LETTER_EXCHANGE = 'verification_dlx';
const DEAD_LETTER_QUEUE = 'verification_dlq';
const DEAD_LETTER_ROUTING_KEY = 'verification.dlq';

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // 1. Assert Dead Letter Exchange and Queue
    await channel.assertExchange(DEAD_LETTER_EXCHANGE, 'direct', { durable: true });
    await channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });
    await channel.bindQueue(DEAD_LETTER_QUEUE, DEAD_LETTER_EXCHANGE, DEAD_LETTER_ROUTING_KEY);

    // 2. Assert Main Exchange
    await channel.assertExchange(VERIFICATION_EXCHANGE, 'direct', { durable: true });

    // 3. Assert Main Queue
    // If a message is rejected (nack) from here, it goes to DLX
    await channel.assertQueue(VERIFICATION_QUEUE, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': DEAD_LETTER_EXCHANGE,
        'x-dead-letter-routing-key': DEAD_LETTER_ROUTING_KEY,
      },
    });
    await channel.bindQueue(VERIFICATION_QUEUE, VERIFICATION_EXCHANGE, VERIFICATION_ROUTING_KEY);

    // 4. Assert Retry Exchange
    await channel.assertExchange(RETRY_EXCHANGE, 'direct', { durable: true });

    // 5. Assert Retry Queue
    // Messages here will sit for their TTL, then be dead-lettered back to the MAIN EXCHANGE
    await channel.assertQueue(RETRY_QUEUE, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': VERIFICATION_EXCHANGE, // Loop back to Main Exchange
        'x-dead-letter-routing-key': VERIFICATION_ROUTING_KEY, // Route back to Main Queue
      },
    });
    await channel.bindQueue(RETRY_QUEUE, RETRY_EXCHANGE, RETRY_ROUTING_KEY);

    console.log('Connected to RabbitMQ. Exchanges and Queues configured for Retry/DLQ.');
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
  
  channel.publish(
    VERIFICATION_EXCHANGE,
    VERIFICATION_ROUTING_KEY,
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  );
};

const publishToRetryQueue = (data, delayMs) => {
  if (!channel) {
    console.error('RabbitMQ channel is not available.');
    return;
  }

  channel.publish(
    RETRY_EXCHANGE,
    RETRY_ROUTING_KEY,
    Buffer.from(JSON.stringify(data)),
    { 
      persistent: true,
      expiration: delayMs.toString()
    }
  );
};

module.exports = {
  connectRabbitMQ,
  publishToQueue,
  publishToRetryQueue,
  getChannel: () => channel,
  VERIFICATION_QUEUE,
};