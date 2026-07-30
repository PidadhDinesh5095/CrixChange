// kafka/topics.js
import { TOPICS } from './constants.js';

// Central place describing topic configuration used by admin.js
// when auto-provisioning topics on boot.
// NOTE: Aiven Kafka enforces a topic-creation policy that only allows
// a replicationFactor matching your plan's node count. Rather than
// guess/hardcode that number, use -1, which tells the broker to use
// the cluster's configured default replication factor. This is a
// documented Kafka protocol value, not an Aiven-specific hack — it's
// the same trick you'd use with `kafka-topics.sh --replication-factor -1`.
const REPLICATION_FACTOR = Number(process.env.KAFKA_REPLICATION_FACTOR || -1);

export const topicConfigs = [
  {
    topic: TOPICS.NOTIFICATION_EVENTS,
    numPartitions: 6,
    replicationFactor: REPLICATION_FACTOR,
    configEntries: [
      { name: 'retention.ms', value: `${7 * 24 * 60 * 60 * 1000}` }, // 7 days
      { name: 'cleanup.policy', value: 'delete' },
    ],
  },
  {
    topic: TOPICS.NOTIFICATION_DLQ,
    numPartitions: 3,
    replicationFactor: REPLICATION_FACTOR,
    configEntries: [
      { name: 'retention.ms', value: `${14 * 24 * 60 * 60 * 1000}` }, // 14 days
    ],
  },
];

export default topicConfigs;