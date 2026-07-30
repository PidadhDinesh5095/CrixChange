// kafka/consumer.js
import kafka from './client.js';
import { TOPICS, KAFKA_GROUP_ID } from './constants.js';
import producer from './producer.js';
import withRetry from './retry.js';

import { authHandlers } from './handlers/auth.handler.js';
import { kycHandlers } from './handlers/kyc.handler.js';
import { walletHandlers } from './handlers/wallet.handler.js';
import { tradeHandlers } from './handlers/trade.handler.js';
import { generalHandler } from './handlers/general.handler.js';

// Merge all domain handler maps into a single { EVENT_TYPE: fn } registry.
const handlerRegistry = {
  ...authHandlers,
  ...kycHandlers,
  ...walletHandlers,
  ...tradeHandlers,
};

const consumer = kafka.consumer({
  groupId: KAFKA_GROUP_ID,
  // Process one message at a time (no batch pipelining), so ordering
  // guarantees from the producer are actually honoured downstream.
  maxInFlightRequests: 1,
  retry: { retries: 5 },
});

export const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: TOPICS.NOTIFICATION_EVENTS, fromBeginning: false });

  await consumer.run({
    // kafkajs invokes eachMessage sequentially, one at a time, per
    // partition. Combined with userId-keyed partitioning in
    // producer.js, this is what preserves chronological order for a
    // given user's notification emails (e.g. welcome before verify).
    eachMessage: async ({ topic, partition, message }) => {
      const key = message.key?.toString();
      let event;

      try {
        event = JSON.parse(message.value.toString());
      } catch (err) {
        console.error('[kafka:consumer] Failed to parse message, sending to DLQ', err.message);
        return sendToDLQ(message, 'PARSE_ERROR');
      }

      const handler = handlerRegistry[event.type] || generalHandler;

      try {
        await withRetry(() => handler(event.payload, event), {
          context: `handler:${event.type}:${key}`,
        });
        console.log(`[kafka:consumer] handled ${event.type} for key=${key} (partition ${partition})`);
      } catch (err) {
        console.error(`[kafka:consumer] giving up on ${event.type} for key=${key}:`, err.message);
        await sendToDLQ(message, err.message);
      }
    },
  });

  console.log('[kafka:consumer] running, subscribed to', TOPICS.NOTIFICATION_EVENTS);
};

const sendToDLQ = async (message, reason) => {
  try {
    await producer.send({
      topic: TOPICS.NOTIFICATION_DLQ,
      messages: [
        {
          key: message.key,
          value: message.value,
          headers: { ...message.headers, failureReason: reason },
        },
      ],
    });
  } catch (err) {
    console.error('[kafka:consumer] failed to write to DLQ:', err.message);
  }
};

export const stopConsumer = async () => {
  await consumer.disconnect();
  console.log('[kafka:consumer] disconnected');
};

export default consumer;