import { useMemo, useState } from 'react';
import { Globe } from 'lucide-react';
import { getFaviconUrl } from '../utils/favicon';

interface FaviconProps {
  url: string;
}

// Site icon from Chrome's favicon API, with a globe when there is none
export const Favicon = ({ url }: FaviconProps) => {
  const faviconUrl = useMemo(() => getFaviconUrl(url), [url]);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!faviconUrl || failedUrl === url) {
    return <Globe className="w-4 h-4 text-icon-placeholder" />;
  }

  return <img src={faviconUrl} alt="" className="w-4 h-4" onError={() => setFailedUrl(url)} />;
};
