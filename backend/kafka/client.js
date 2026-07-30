// kafka/client.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Kafka, logLevel } from 'kafkajs';
import { KAFKA_CLIENT_ID, KAFKA_BROKERS, KAFKA_USERNAME, KAFKA_PASSWORD } from './constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));



if (!Array.isArray(KAFKA_BROKERS) || KAFKA_BROKERS.length === 0 || KAFKA_BROKERS.some((b) => !b)) {
  throw new Error(
    `[kafka:client] Invalid KAFKA_BROKERS: ${JSON.stringify(KAFKA_BROKERS)}. ` +
      'Make sure dotenv/config (or your env loader) runs before any kafka module is imported, ' +
      'and that KAFKA_BROKERS is set like "localhost:9092" or "host1:9092,host2:9092".'
  );
}

const useSasl = Boolean(KAFKA_USERNAME && KAFKA_PASSWORD);

if (!useSasl) {
  console.warn(
    '[kafka:client] KAFKA_USERNAME/KAFKA_PASSWORD not set — connecting without SASL. ' +
      'This will fail against Upstash Kafka, which requires authentication.'
  );
}

// Aiven's broker cert is signed by Aiven's own CA — Node won't trust it
// by default, hence "self-signed certificate in certificate chain".
// Download the CA cert from the Aiven console (Overview -> CA certificate -> Show)
// and save it at kafka/certs/ca.pem
const caPath = path.join(__dirname, 'certs', 'ca.pem');
const ca = fs.existsSync(caPath) ? [fs.readFileSync(caPath, 'utf-8')] : undefined;

if (useSasl && !ca) {
  console.warn(
    `[kafka:client] CA cert not found at ${caPath}. ` +
      'Download it from the Aiven console and save it there, or TLS will fail with ' +
      '"self-signed certificate in certificate chain".'
  );
}

export const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
  logLevel: logLevel.INFO,
  ssl: useSasl
    ? {
        ca,
        rejectUnauthorized: true,
      }
    : false,
  sasl: useSasl
    ? {
        mechanism: 'scram-sha-256', // check Aiven console — could be scram-sha-512
        username: KAFKA_USERNAME,
        password: KAFKA_PASSWORD,
      }
    : undefined,
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
});

export default kafka;