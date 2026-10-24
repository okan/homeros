export const BOOKMARKS_STORAGE_KEY = 'homeros_bookmarks';
export const INBOX_STORAGE_KEY = 'homeros_inbox';

// Web Lock shared by the new tab pages and the background worker, so read-modify-write
// updates of chrome.storage never interleave
export const STORAGE_LOCK = 'homeros-storage';

// A write's change event normally comes back within milliseconds; after this it's forgotten
const ECHO_TIMEOUT_MS = 10_000;

// chrome.storage hands objects back with their keys sorted, so compare values in that form
export const stableStringify = (value: unknown): string =>
  JSON.stringify(value, (_, nested) =>
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? Object.fromEntries(
          Object.keys(nested)
            .sort()
            .map((key) => [key, nested[key]]),
        )
      : nested,
  );

// What this page last read from or wrote to each key, as stableStringify output
const lastSynced = new Map<string, string>();
// Values this page wrote whose onChanged event hasn't come back yet
const pendingEchoes = new Map<string, { value: string; writtenAt: number }[]>();

export const getSynced = (key: string) => lastSynced.get(key);

export const isSynced = (key: string, serialized: string) => lastSynced.get(key) === serialized;

export const markSynced = (key: string, serialized: string) => {
  lastSynced.set(key, serialized);
};

// Sorts a change event into this page's own write coming back, an older write that this page's
// newer one (made under the lock, after reading it) already includes, or a new external change
export const classifyChange = (key: string, serialized: string): 'own' | 'stale' | 'external' => {
  const now = Date.now();
  const echoes = (pendingEchoes.get(key) ?? []).filter(
    (echo) => now - echo.writtenAt < ECHO_TIMEOUT_MS,
  );
  const index = echoes.findIndex((echo) => echo.value === serialized);
  if (index !== -1) {
    pendingEchoes.set(key, echoes.slice(index + 1));
    return 'own';
  }
  pendingEchoes.set(key, echoes);
  return echoes.length > 0 ? 'stale' : 'external';
};

// Writes the items in one chrome.storage call, so they land together or not at all. Keys whose
// stored value is already the same are left out: Chrome sends no change event for them.
// Call it while holding STORAGE_LOCK.
export const writeSynced = async (items: Record<string, unknown>) => {
  const stored = await chrome.storage.local.get(Object.keys(items));
  const serialized = Object.fromEntries(
    Object.entries(items).map(([key, value]) => [key, stableStringify(value)]),
  );
  const changedKeys = Object.keys(items).filter(
    (key) => stableStringify(stored[key]) !== serialized[key],
  );

  for (const key of Object.keys(items)) lastSynced.set(key, serialized[key]);
  if (changedKeys.length === 0) return;

  const writtenAt = Date.now();
  for (const key of changedKeys) {
    pendingEchoes.set(key, [
      ...(pendingEchoes.get(key) ?? []),
      { value: serialized[key], writtenAt },
    ]);
  }

  try {
    await chrome.storage.local.set(Object.fromEntries(changedKeys.map((key) => [key, items[key]])));
  } catch (error) {
    for (const key of changedKeys) {
      lastSynced.delete(key);
      pendingEchoes.set(
        key,
        (pendingEchoes.get(key) ?? []).filter((echo) => echo.writtenAt !== writtenAt),
      );
    }
    throw error;
  }
};

type Merge<T> = (base: T, ours: T, theirs: T) => T;

// This page's version of a key, with whatever another page stored since `base` (the synced
// version this page's edits were made on top of) merged in. Call it while holding STORAGE_LOCK.
export const mergeWithStored = async <T>(
  key: string,
  value: T,
  base: string | undefined,
  merge: Merge<T>,
): Promise<T> => {
  const current = (await chrome.storage.local.get(key))[key];
  const changedElsewhere =
    current !== undefined && base !== undefined && stableStringify(current) !== base;
  return changedElsewhere ? merge(JSON.parse(base), value, current) : value;
};

// Saves this page's version of a key without overwriting what other pages saved meanwhile.
// Returns what was stored.
export const writeMerged = async <T>(key: string, value: T, merge: Merge<T>): Promise<T> => {
  // Taken before waiting for the lock, since a change event can move it in the meantime
  const base = lastSynced.get(key);

  return navigator.locks.request(STORAGE_LOCK, async () => {
    const merged = await mergeWithStored(key, value, base, merge);
    await writeSynced({ [key]: merged });
    return merged;
  });
};
