import { Redis } from "@upstash/redis";

const SCAN_RATE_LIMIT_MAX_REQUESTS = 10;
const SCAN_RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const SCAN_RATE_LIMIT_WINDOW_MS = SCAN_RATE_LIMIT_WINDOW_SECONDS * 1000;

const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashRedisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  upstashRedisRestUrl && upstashRedisRestToken
    ? new Redis({
        url: upstashRedisRestUrl,
        token: upstashRedisRestToken,
      })
    : null;
const isProduction = process.env.NODE_ENV === "production";

export async function checkScanRateLimit(userKey: string) {
  if (!redis) {
    console.error("Scan rate limit disabled: missing Upstash Redis configuration");
    return isProduction
      ? { allowed: false, reason: "missing_redis_configuration" }
      : { allowed: true, reason: "missing_redis_configuration" };
  }

  const hourWindow = Math.floor(Date.now() / SCAN_RATE_LIMIT_WINDOW_MS);
  const key = `scan-rate-limit:${userKey}:${hourWindow}`;

  try {
    const requestCount = await redis.incr(key);

    if (requestCount === 1) {
      await redis.expire(key, SCAN_RATE_LIMIT_WINDOW_SECONDS);
    }

    return { allowed: requestCount <= SCAN_RATE_LIMIT_MAX_REQUESTS };
  } catch (error) {
    console.error("Scan rate limit failed", error);
    return isProduction
      ? { allowed: false, reason: "redis_unavailable" }
      : { allowed: true, reason: "redis_unavailable" };
  }
}
