export const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const getDomainFromUrl = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

// Query and fragment parameters that commonly carry sign-in tokens or other secrets
const SENSITIVE_PARAMS = new Set([
  'access_token',
  'id_token',
  'refresh_token',
  'auth_token',
  'token',
  'session',
  'sessionid',
  'session_id',
  'password',
  'passwd',
  'pwd',
  'secret',
  'client_secret',
  'api_key',
  'apikey',
  'signature',
  'x-amz-signature',
  'x-amz-credential',
  'x-amz-security-token',
  'x-goog-signature',
  'x-goog-credential',
]);

// Removes sensitive parameters from a query string; other parameters are left byte for byte
const stripSensitiveParams = (query: string): string =>
  query
    .split('&')
    .filter((pair) => {
      const name = pair.split('=')[0];
      try {
        return !SENSITIVE_PARAMS.has(decodeURIComponent(name.replace(/\+/g, ' ')).toLowerCase());
      } catch {
        return true;
      }
    })
    .join('&');

// What to store for a saved page: http(s) only, without embedded credentials or the
// parameters above (also in fragments like #access_token=… or #/path?token=…).
// Returns null when the URL isn't a web page.
export const cleanUrlForSaving = (value: string): string | null => {
  if (!isValidUrl(value)) return null;

  const url = new URL(value);
  url.username = '';
  url.password = '';
  url.search = stripSensitiveParams(url.search.slice(1));

  const hash = url.hash.slice(1);
  const queryStart = hash.indexOf('?') + 1;
  if (hash.includes('=')) {
    url.hash = hash.slice(0, queryStart) + stripSensitiveParams(hash.slice(queryStart));
  }

  return url.toString();
};

// Comparable form of a URL: scheme, host and a trailing slash don't matter, but path, query and
// fragment keep their case since servers can treat them as different pages
export const normalizeUrl = (value: string): string => {
  try {
    const url = new URL(value);
    const path = url.pathname.replace(/\/+$/, '');
    return `${url.protocol}//${url.host}${path}${url.search}${url.hash}`;
  } catch {
    return value.trim();
  }
};
