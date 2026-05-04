import axios from 'axios';
import dotenv from 'dotenv';
import { redisClient, connectRedis } from '../config/redis.js';

dotenv.config();

// ─── Cache keys ───────────────────────────────────────────────────────────────
const CACHE_KEY        = 'ipl:matches';
const CACHE_STATUS_KEY = 'ipl:matches:status';

// ─── IST time helpers ─────────────────────────────────────────────────────────
// We derive IST by converting any Date to a locale string in Asia/Kolkata and
// parsing it back. This works correctly on any server region — no manual offset
// arithmetic, no risk of DST bugs (India has no DST, but the pattern is solid).

/**
 * Returns the current time as a Date object set to IST wall-clock time.
 * Use this as the baseline "now" for all match time comparisons.
 *
 * How it works:
 *   new Date()                          → current moment (UTC internally)
 *   .toLocaleString("en-US", {...})     → "5/4/2026, 7:30:00 PM"  (IST string)
 *   new Date(istString)                 → Date object whose numeric value
 *                                         represents that IST wall-clock moment
 */
const getISTNow = () => {
  const now       = new Date();
  const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(istString);
};

/**
 * Converts any UTC epoch ms value to a Date object representing that
 * moment in IST wall-clock time.
 * Use before any comparison that should be evaluated in India time.
 */
const toISTDate = (utcMs) => {
  const date      = new Date(utcMs);
  const istString = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(istString);
};

/**
 * Formats a UTC epoch ms value as a readable IST date string.
 */
const formatISTDate = (utcMs) =>
  new Date(utcMs).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

/**
 * Formats a UTC epoch ms value as a readable IST time string.
 */
const formatISTTime = (utcMs) =>
  new Date(utcMs).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata',
  });

// ─── Cricbuzz live statuses ───────────────────────────────────────────────────
const LIVE_STATUSES = new Set([
  'in progress',
  'innings break',
  'rain delay',
  'stumps',
  'tea',
  'lunch',
  'drinks',
]);

// ─── Adaptive TTL (seconds) ───────────────────────────────────────────────────
//
// Phase table:
//   Any match actively live              →  15 seconds
//   Any match starting within 30 min    →  60 seconds   (IST wall-clock)
//   All matches > 30 min away / unknown →  30 minutes
const getAdaptiveTTL = (matches = []) => {
  // Both sides of every comparison are IST wall-clock values
  const nowIST = getISTNow(); // ← IST "now" via toLocaleString pattern

  const hasLive = matches.some((m) =>
    LIVE_STATUSES.has(m.status?.toLowerCase?.() ?? '')
  );
  if (hasLive) return 15;

  const msToNearest = matches.reduce((min, m) => {
    if (!m.startTimestamp) return min;
    const startIST = toISTDate(m.startTimestamp); // ← UTC epoch → IST Date
    const diff     = startIST.getTime() - nowIST.getTime(); // IST vs IST → correct duration
    return diff > 0 && diff < min ? diff : min;
  }, Infinity);

  if (msToNearest <= 30 * 60 * 1000) return 60;
  return 30 * 60;
};

// ─── Cricbuzz API options ─────────────────────────────────────────────────────
const optionsLive = {
  method: 'GET',
  url: process.env.SPORTS_API_LIVE_MATCHES_URL,
  headers: {
    'x-rapidapi-key':  process.env.SPORTS_API_KEY,
    'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com',
    'Content-Type':    'application/json',
  },
};

const optionsUpcoming = {
  method: 'GET',
  url: process.env.SPORTS_API_UPCOMING_MATCHES_URL,
  headers: {
    'x-rapidapi-key':  process.env.SPORTS_API_KEY,
    'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com',
    'Content-Type':    'application/json',
  },
};

// ─── Parse Cricbuzz typeMatches → flat match objects ─────────────────────────
const extractIPLMatches = (typeMatchesArray = [], skipComplete = false) => {
  const results = [];

  typeMatchesArray.forEach((type) => {
    if (type?.matchType !== 'League') return;

    (type?.seriesMatches || []).forEach((series) => {
      const wrapper = series?.seriesAdWrapper;
      if (!wrapper?.seriesName?.toLowerCase().includes('indian premier league')) return;

      (wrapper?.matches || []).forEach((m) => {
        const info = m?.matchInfo;
        if (!info) return;
        if (skipComplete && info?.state === 'Complete') return;

        const startTimestamp = Number(info?.startDate); // UTC epoch ms from Cricbuzz

        results.push({
          id:             info?.matchId,
          match:          `${info?.team1?.teamSName} vs ${info?.team2?.teamSName}`,
          team1:          info?.team1?.teamSName?.toUpperCase() || '',
          team2:          info?.team2?.teamSName?.toUpperCase() || '',
          date:           formatISTDate(startTimestamp), // always IST, server-locale-safe
          time:           formatISTTime(startTimestamp), // always IST, server-locale-safe
          startTimestamp,                                // raw UTC epoch ms for TTL math
          venue:          info?.venueInfo?.city   || '',
          ground:         info?.venueInfo?.ground || '',
          status:         info?.state,
        });
      });
    });
  });

  return results;
};

// ─── Controller ───────────────────────────────────────────────────────────────
export const getCurrentMatches = async (req, res) => {
  try {
    await connectRedis();

    // ── 1. Cache hit ───────────────────────────────────────────────────────
    const cached = await redisClient.get(CACHE_KEY);

    if (cached) {
      console.log('[Cache] HIT — serving ipl:matches from Redis');
      
      return res.status(200).json({
        success: true,
        message: 'Current matches retrieved successfully (cached)',
        matches: cached,
      });
    }

    // ── 2. Cache miss → call Sports API ───────────────────────────────────
    console.log('[Cache] MISS — fetching from Cricbuzz API');

    const [liveRes, upcomingRes] = await Promise.all([
      axios.request(optionsLive),
      axios.request(optionsUpcoming),
    ]);

    // ── 3. Parse and deduplicate ───────────────────────────────────────────
    const liveMatches     = extractIPLMatches(liveRes.data?.typeMatches     || [], true);
    const upcomingMatches = extractIPLMatches(upcomingRes.data?.typeMatches || [], false);

    const seenIds = new Set();
    const matches = [...liveMatches, ...upcomingMatches].filter((m) => {
      if (seenIds.has(m.id)) return false;
      seenIds.add(m.id);
      return true;
    });

    // ── 4. Compute IST-aware adaptive TTL and write to Redis ──────────────
    const ttlSeconds = getAdaptiveTTL(matches);
    const nowIST     = getISTNow();

    console.log(`[IST]   Current IST time  = ${nowIST.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
    console.log(`[Cache] TTL = ${ttlSeconds}s | matches = ${matches.length}`);

    await redisClient.set(CACHE_KEY, JSON.stringify(matches), { EX: ttlSeconds });

    // ── 5. Status snapshot for future SSE diff ────────────────────────────
    const snapshot = {};
    matches.forEach((m) => { snapshot[m.id] = m.status; });
    await redisClient.set(CACHE_STATUS_KEY, JSON.stringify(snapshot), {
      EX: ttlSeconds * 10,
    });

    return res.status(200).json({
      success: true,
      message: 'Current matches retrieved successfully',
      matches,
    });

  } catch (error) {
    console.error('Error fetching current matches:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching current matches',
      error:   error.message,
    });
  }
};