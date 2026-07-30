// kafka/retry.js
import { RETRY_CONFIG } from './constants.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs `fn` with exponential backoff retries.
 *
 * Used to wrap individual email dispatch calls so a transient SMTP
 * failure doesn't silently drop a notification. Because the consumer
 * awaits this per-message before moving to the next offset, retrying
 * here (rather than skipping ahead) is also what protects the
 * chronological ordering guarantee for a given user's events.
 */
export const withRetry = async (fn, {
  retries = RETRY_CONFIG.MAX_RETRIES,
  initialDelay = RETRY_CONFIG.INITIAL_RETRY_TIME,
  factor = RETRY_CONFIG.RETRY_FACTOR,
  context = 'kafka-task',
} = {}) => {
  let attempt = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (attempt > retries) {
        console.error(`[retry] ${context} failed after ${retries} retries:`, err.message);
        throw err;
      }
      console.warn(
        `[retry] ${context} failed (attempt ${attempt}/${retries}), retrying in ${delay}ms:`,
        err.message
      );
      await sleep(delay);
      delay *= factor;
    }
  }
};

export default withRetry;