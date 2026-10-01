const buckets = new Map();

export const rateLimit =
  ({ windowMs, max, key, message }) =>
  (req, res, next) => {
    const id = key(req);
    const now = Date.now();
    const entry = buckets.get(id);

    if (!entry || entry.resetAt <= now) {
      buckets.set(id, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, message });
    }
    next();
  };

// Drop expired entries so the map cannot grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(id);
  }
}, 60_000).unref();