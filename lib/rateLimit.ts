import { Redis } from "@upstash/redis";

const SCAN_RATE_LIMIT_MAX_REQUESTS = 10;
const SCAN_RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const SCAN_RATE_LIMIT_WINDOW_MS = SCAN_RATE_LIMIT_WINDOW_SECONDS * 1000;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkScanRateLimit(userKey: string) {
  const hourWindow = Math.floor(Date.now() / SCAN_RATE_LIMIT_WINDOW_MS);
  const key = `scan-rate-limit:${userKey}:${hourWindow}`;
  const requestCount = await redis.incr(key);

  if (requestCount === 1) {
    await redis.expire(key, SCAN_RATE_LIMIT_WINDOW_SECONDS);
  }

  return { allowed: requestCount <= SCAN_RATE_LIMIT_MAX_REQUESTS };
}
