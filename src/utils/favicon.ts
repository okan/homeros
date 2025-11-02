export const getFaviconUrls = (url: string): string[] => {
  try {
    const urlObj = new URL(url);
    const origin = urlObj.origin;

    return [
      `${origin}/favicon.ico`,
      `${origin}/favicon.png`,
      `${origin}/apple-touch-icon.png`,
      `${origin}/apple-touch-icon-precomposed.png`,
    ];
  } catch {
    return [];
  }
};
