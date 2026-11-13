const CACHE_PREFIX = 'audi-cache-v3:';

type CacheEntry<T> = { t: number; v: T };

const memory = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

function readSession<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (!entry || typeof entry.t !== 'number') return null;
    if (Date.now() - entry.t > ttlMs) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.v;
  } catch {
    return null;
  }
}

function writeSession<T>(key: string, value: T) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    // Storage can be full or disabled (private mode). Memory cache still works.
  }
}

/**
 * Short-lived cache with in-flight de-duplication.
 *
 * Page navigations inside the SPA reuse the data instantly, while a hard
 * refresh still gets fresh data after the TTL expires.
 */
export async function cachedFetchJson<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = memory.get(key) as CacheEntry<T> | undefined;
  if (cached && Date.now() - cached.t <= ttlMs) return cached.v;

  const stored = readSession<T>(key, ttlMs);
  if (stored !== null) {
    memory.set(key, { t: Date.now(), v: stored });
    return stored;
  }

  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const request = fetcher()
    .then((value) => {
      const entry = { t: Date.now(), v: value };
      memory.set(key, entry);
      writeSession(key, value);
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, request);
  return request;
}

export function clearApiCache(prefix?: string) {
  const match = (key: string) => !prefix || key.startsWith(prefix);
  for (const key of Array.from(memory.keys())) {
    if (match(key)) memory.delete(key);
  }
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
      const key = sessionStorage.key(i);
      if (!key || !key.startsWith(CACHE_PREFIX)) continue;
      if (match(key.slice(CACHE_PREFIX.length))) sessionStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}
