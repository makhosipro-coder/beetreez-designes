const store = new Map<string, { timestamps: number[] }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  return { allowed: true, remaining: MAX_REQUESTS - entry.timestamps.length };
}

export function getRateLimitHeaders(key: string) {
  const { allowed, remaining } = checkRateLimit(key);
  return {
    'X-RateLimit-Limit': String(MAX_REQUESTS),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil((Date.now() + WINDOW_MS) / 1000)),
    ...(allowed ? {} : { 'Retry-After': String(Math.ceil(WINDOW_MS / 1000)) }),
  };
}
