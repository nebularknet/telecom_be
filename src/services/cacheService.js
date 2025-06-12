// Simple in-memory cache implementation
const cache = {}; // Using a plain object as the cache store

const DEFAULT_TTL_SECONDS = 60 * 60; // 1 hour

/**
 * Sets a value in the cache with an optional TTL.
 * @param {string} key - The cache key.
 * @param {any} value - The value to cache.
 * @param {number} [ttlSeconds] - Optional TTL in seconds. Defaults to DEFAULT_TTL_SECONDS.
 */
const set = (key, value, ttlSeconds) => {
  const ttl = ttlSeconds || DEFAULT_TTL_SECONDS;
  const expiresAt = Date.now() + ttl * 1000;
  cache[key] = {
    value,
    expiresAt,
  };
  // console.log(`Cache SET for key: ${key}, TTL: ${ttl}s`);
};

/**
 * Gets a value from the cache. Returns undefined if not found or expired.
 * @param {string} key - The cache key.
 * @returns {any|undefined} The cached value or undefined.
 */
const get = (key) => {
  const entry = cache[key];
  if (entry) {
    if (Date.now() < entry.expiresAt) {
      // console.log(`Cache HIT for key: ${key}`);
      return entry.value;
    } else {
      // console.log(`Cache EXPIRED for key: ${key}`);
      delete cache[key]; // Clean up expired entry
    }
  }
  // console.log(`Cache MISS for key: ${key}`);
  return undefined;
};

/**
 * Deletes a key from the cache.
 * @param {string} key - The cache key.
 */
const del = (key) => {
  // console.log(`Cache DEL for key: ${key}`);
  delete cache[key];
};

/**
 * Clears the entire cache.
 */
const flush = () => {
  // console.log('Cache FLUSHED');
  for (const key in cache) {
    if (Object.hasOwnProperty.call(cache, key)) {
      delete cache[key];
    }
  }
};

module.exports = {
  get,
  set,
  del,
  flush,
  DEFAULT_TTL_SECONDS,
};
