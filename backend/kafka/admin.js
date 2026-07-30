
import kafka from './client.js';
import topicConfigs from './topics.js';

const admin = kafka.admin();

export const ensureTopics = async () => {
  await admin.connect();
  // try {
  //   const existingTopics = await admin.listTopics();
  //   const topicsToCreate = topicConfigs.filter(
  //     (t) => !existingTopics.includes(t.topic)
  //   );

  //   if (topicsToCreate.length) {
  //     await admin.createTopics({
  //       waitForLeaders: true,
  //       topics: topicsToCreate,
  //     });
  //     console.log(
  //       `[kafka:admin] Created topics: ${topicsToCreate.map((t) => t.topic).join(', ')}`
  //     );
  //   } else {
  //     console.log('[kafka:admin] All required topics already exist.');
  //   }
  // } finally {
  //   await admin.disconnect();
  // }
};

export default admin;