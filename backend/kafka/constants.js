
// kafka/constants.js
export const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'crixchange-notification-service';
export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
export const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'notification-service-group';

// Required for Upstash Kafka (SASL/SCRAM over TLS). Leave unset for a
// local/plaintext broker (e.g. Docker Kafka without auth).
export const KAFKA_USERNAME = process.env.KAFKA_USERNAME || '';
export const KAFKA_PASSWORD = process.env.KAFKA_PASSWORD || '';

export const TOPICS = {
  NOTIFICATION_EVENTS: 'notification-events',
  NOTIFICATION_DLQ: 'notification-events-dlq',
};

// All notification events flow through ONE topic (NOTIFICATION_EVENTS)
// and are keyed by userId. This is deliberate: Kafka only guarantees
// message order *within a partition*, and keying by userId routes all
// of that user's events to the same partition, in the exact order
// they were produced. That's what lets us guarantee, e.g., that the
// welcome email is processed before the verification email, or that
// "withdrawal initiated" is processed before "withdrawal completed".
export const EVENT_TYPES = {
  // Auth domain
  USER_REGISTERED: 'USER_REGISTERED',           // -> welcome email, then verification email
  EMAIL_VERIFIED: 'EMAIL_VERIFIED', 
  EMAIL_VERIFY_REQUESTED: 'EMAIL_VERIFY_REQUESTED',             // -> verification success email (prompts KYC)
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',

  // KYC domain
  KYC_APPROVED: 'KYC_APPROVED',
  KYC_REJECTED: 'KYC_REJECTED',

  // Wallet domain
  DEPOSIT_SUCCESS: 'DEPOSIT_SUCCESS',
  WITHDRAWAL_INITIATED: 'WITHDRAWAL_INITIATED',
  WITHDRAWAL_COMPLETED: 'WITHDRAWAL_COMPLETED',

  // Trade domain
  TRADE_EXECUTED: 'TRADE_EXECUTED',
};

export const RETRY_CONFIG = {
  MAX_RETRIES: 5,
  INITIAL_RETRY_TIME: 300,
  RETRY_FACTOR: 2,
};