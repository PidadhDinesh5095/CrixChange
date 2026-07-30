// kafka/producer.js
import kafka from './client.js';
import { TOPICS } from './constants.js';
import withRetry from './retry.js';

const producer = kafka.producer({
  allowAutoTopicCreation: false,
  idempotent: true, // avoids duplicate events on retry, which matters for ordering
});

let isConnected = false;

export const connectProducer = async () => {
  if (isConnected) return;
  await producer.connect();
  isConnected = true;
  console.log('[kafka:producer] connected');
};

export const disconnectProducer = async () => {
  if (!isConnected) return;
  await producer.disconnect();
  isConnected = false;
  console.log('[kafka:producer] disconnected');
};

/**
 * Publishes a notification event.
 *
 * @param {string} type    - one of EVENT_TYPES
 * @param {string} key     - MUST be the userId (or another stable per-user id)
 * @param {object} payload - data the handler needs (email, name, urls, etc.)
 *
 * IMPORTANT: `key` must be the userId. Kafka guarantees ordering
 * within a partition, and keying by userId routes all of a user's
 * events to the same partition, so they're delivered to the consumer
 * in the exact order they were produced:
 *   USER_REGISTERED -> EMAIL_VERIFIED -> KYC_APPROVED -> ...
 * Do not omit the key, and do not use something like a random uuid.
 */
export const publishEvent = async (type, key, payload) => {
  await connectProducer();

  const event = {
    type,
    payload,
    producedAt: new Date().toISOString(),
  };

  return withRetry(
    () =>
      producer.send({
        topic: TOPICS.NOTIFICATION_EVENTS,
        messages: [
          {
            key: String(key),
            value: JSON.stringify(event),
            headers: { eventType: type },
          },
        ],
      }),
    { context: `publishEvent:${type}` }
  );
};

export default producer;