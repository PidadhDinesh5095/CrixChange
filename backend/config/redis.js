import { Redis } from '@upstash/redis';

const redisClient = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// No connect() needed — Upstash is REST-based, every call is stateless.
// This ping just verifies credentials on server startup.
const connectRedis = async () => {
  try {
    await redisClient.ping();
    console.log('✅ Upstash Redis connected');
  } catch (err) {
    console.error('❌ Upstash Redis error:', err.message);
  }
};

export { redisClient, connectRedis };