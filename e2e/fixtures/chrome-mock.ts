export function createChromeMockScript(initialStorage: Record<string, unknown> = {}) {
  const serializedStorage = JSON.stringify(initialStorage);

  return `
    (() => {
      // Like chrome.storage: values are kept and handed out as copies, with object keys sorted
      const canonical = (value) =>
        value === undefined
          ? undefined
          : JSON.parse(
              JSON.stringify(value, (_, nested) =>
                nested && typeof nested === 'object' && !Array.isArray(nested)
                  ? Object.fromEntries(Object.keys(nested).sort().map((key) => [key, nested[key]]))
                  : nested,
              ),
            );

      // Test hooks: local writes per key, keys read so far, and delays for events and reads
      window.__storageWrites = {};
      window.__storageGets = [];
      window.__storageEventDelay = 0;
      window.__storageGetDelay = {};

      const changeListeners = new Set();

      // Chrome delivers change events asynchronously, and only for values that actually changed
      const notifyChange = (changes, areaName) => {
        if (Object.keys(changes).length === 0) return;
        setTimeout(() => {
          for (const listener of changeListeners) {
            listener(canonical(changes), areaName);
          }
        }, window.__storageEventDelay);
      };

      const createStorageArea = (areaName, initial) => {
        const store = new Map(
          Object.entries(initial).map(([key, value]) => [key, canonical(value)]),
        );

        return {
          get: (keys, callback) => {
            const result = {};
            const keyList = typeof keys === 'string' ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys || {});
            let delay = 0;
            for (const key of keyList) {
              if (areaName === 'local') window.__storageGets.push(key);
              if (store.has(key)) {
                result[key] = canonical(store.get(key));
              }
              delay = Math.max(delay, window.__storageGetDelay[key] || 0);
            }
            // The result is a snapshot taken now, even when it's handed back later
            if (!delay) {
              if (callback) callback(result);
              return Promise.resolve(result);
            }
            return new Promise((resolve) =>
              setTimeout(() => {
                if (callback) callback(result);
                resolve(result);
              }, delay),
            );
          },
          set: (items, callback) => {
            const changes = {};
            for (const [key, value] of Object.entries(items)) {
              if (areaName === 'local') {
                window.__storageWrites[key] = (window.__storageWrites[key] || 0) + 1;
              }
              const oldValue = store.get(key);
              const newValue = canonical(value);
              store.set(key, newValue);
              if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changes[key] = oldValue === undefined ? { newValue } : { oldValue, newValue };
              }
            }
            notifyChange(changes, areaName);
            if (callback) callback();
            return Promise.resolve();
          },
          remove: (keys, callback) => {
            const changes = {};
            const keyList = typeof keys === 'string' ? [keys] : keys;
            for (const key of keyList) {
              if (store.has(key)) {
                changes[key] = { oldValue: store.get(key) };
                store.delete(key);
              }
            }
            notifyChange(changes, areaName);
            if (callback) callback();
            return Promise.resolve();
          },
          clear: (callback) => {
            const changes = {};
            for (const [key, oldValue] of store) {
              changes[key] = { oldValue };
            }
            store.clear();
            notifyChange(changes, areaName);
            if (callback) callback();
            return Promise.resolve();
          },
          onChanged: {
            addListener: () => {},
            removeListener: () => {},
            hasListener: () => false,
          },
        };
      };

      window.chrome = {
        storage: {
          local: createStorageArea('local', ${serializedStorage}),
          sync: createStorageArea('sync', {}),
          onChanged: {
            addListener: (listener) => changeListeners.add(listener),
            removeListener: (listener) => changeListeners.delete(listener),
            hasListener: (listener) => changeListeners.has(listener),
          },
        },
        runtime: {
          lastError: null,
          id: 'test-extension-id',
          getURL: (path) => 'chrome-extension://test-extension-id/' + path,
          onMessage: {
            addListener: () => {},
            removeListener: () => {},
          },
        },
      };
    })();
  `;
}
