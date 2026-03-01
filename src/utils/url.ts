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
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
};
