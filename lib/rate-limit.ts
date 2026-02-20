const attempts = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup to prevent memory leaks in long-running processes
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of attempts) {
    if (now > entry.resetAt) attempts.delete(key);
  }
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  cleanup();

  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}
