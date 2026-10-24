export const BOOKMARKS_STORAGE_KEY = 'homeros_bookmarks';
export const INBOX_STORAGE_KEY = 'homeros_inbox';

// Web Lock shared by the new tab pages and the background worker for read-modify-write updates
export const STORAGE_LOCK = 'homeros-storage';

const MAX_PENDING_ECHOES = 10;

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
const pendingEchoes = new Map<string, string[]>();

export const isSynced = (key: string, serialized: string) => lastSynced.get(key) === serialized;

export const markSynced = (key: string, serialized: string) => {
  lastSynced.set(key, serialized);
};

// True when a change event is one of this page's own writes coming back
export const consumeEcho = (key: string, serialized: string): boolean => {
  const echoes = pendingEchoes.get(key) ?? [];
  const index = echoes.indexOf(serialized);
  if (index === -1) return false;

  pendingEchoes.set(key, echoes.slice(index + 1));
  return true;
};

// Writes all items in one chrome.storage call, so they land together or not at all
export const writeSynced = async (items: Record<string, unknown>) => {
  const serialized = Object.entries(items).map(([key, value]) => [key, stableStringify(value)]);

  for (const [key, value] of serialized) {
    lastSynced.set(key, value);
    pendingEchoes.set(key, [...(pendingEchoes.get(key) ?? []), value].slice(-MAX_PENDING_ECHOES));
  }

  try {
    await chrome.storage.local.set(items);
  } catch (error) {
    for (const [key, value] of serialized) {
      lastSynced.delete(key);
      pendingEchoes.set(
        key,
        (pendingEchoes.get(key) ?? []).filter((echo) => echo !== value),
      );
    }
    throw error;
  }
};
