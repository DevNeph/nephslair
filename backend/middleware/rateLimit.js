const buckets = new Map();

function rateLimit({ windowMs = 60 * 1000, max = 20, keyGenerator } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const key = keyGenerator ? keyGenerator(req) : `${req.ip}:${req.path}`;
    const entry = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }

    entry.count += 1;
    buckets.set(key, entry);

    if (entry.count > max) {
      res.status(429).json({ success: false, message: 'Too many requests, please try again later.' });
      return;
    }

    next();
  };
}

module.exports = rateLimit;
