export function createChromeMockScript(initialStorage: Record<string, unknown> = {}) {
  const serializedStorage = JSON.stringify(initialStorage);

  return `
    (() => {
      const store = new Map(Object.entries(${serializedStorage}));

      const createStorageArea = () => ({
        get: (keys, callback) => {
          const result = {};
          const keyList = typeof keys === 'string' ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys || {});
          for (const key of keyList) {
            if (store.has(key)) {
              result[key] = store.get(key);
            }
          }
          if (callback) callback(result);
          return Promise.resolve(result);
        },
        set: (items, callback) => {
          for (const [key, value] of Object.entries(items)) {
            store.set(key, value);
          }
          if (callback) callback();
          return Promise.resolve();
        },
        remove: (keys, callback) => {
          const keyList = typeof keys === 'string' ? [keys] : keys;
          for (const key of keyList) {
            store.delete(key);
          }
          if (callback) callback();
          return Promise.resolve();
        },
        clear: (callback) => {
          store.clear();
          if (callback) callback();
          return Promise.resolve();
        },
        onChanged: {
          addListener: () => {},
          removeListener: () => {},
          hasListener: () => false,
        },
      });

      window.chrome = {
        storage: {
          local: createStorageArea(),
          sync: createStorageArea(),
          onChanged: {
            addListener: () => {},
            removeListener: () => {},
            hasListener: () => false,
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
