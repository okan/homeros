export const getFaviconUrl = (url: string, size = 32): string | null => {
  try {
    const pageUrl = new URL(url).toString();

    if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
      const faviconUrl = new URL(chrome.runtime.getURL('/_favicon/'));
      faviconUrl.searchParams.set('pageUrl', pageUrl);
      faviconUrl.searchParams.set('size', String(size));
      return faviconUrl.toString();
    }

    return null;
  } catch {
    return null;
  }
};
