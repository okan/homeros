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
