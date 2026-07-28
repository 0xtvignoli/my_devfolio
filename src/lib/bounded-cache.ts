/**
 * Insertion-ordered cache with a hard entry cap. Used for assistant answers:
 * visitors ask the same handful of questions ("what has he done with
 * Kubernetes?") and the context is static, so the answer is too.
 *
 * ponytail: per-instance and never expires — fine while the context is a static
 * build-time constant. If the context ever becomes dynamic, key on its hash or
 * add a TTL.
 */
export type BoundedCache<T> = {
  get: (key: string) => T | undefined;
  set: (key: string, value: T) => void;
  readonly size: number;
};

export function createBoundedCache<T>(maxEntries: number): BoundedCache<T> {
  const entries = new Map<string, T>();

  return {
    get: (key) => entries.get(key),
    set: (key, value) => {
      // Re-insert so a repeated key moves to the back and survives eviction.
      entries.delete(key);
      entries.set(key, value);
      while (entries.size > maxEntries) {
        const oldest = entries.keys().next().value;
        if (oldest === undefined) break;
        entries.delete(oldest);
      }
    },
    get size() {
      return entries.size;
    },
  };
}
