import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { DEFAULT_SITE } from '@/lib/site/defaults';
import type { SiteContent } from '@/lib/site/schema';

const SiteContext = createContext<SiteContent>(DEFAULT_SITE);

/**
 * Pages with getStaticProps pass `site` (rendered on the server, good for
 * search engines). Other pages fetch it once in the browser; until it
 * arrives, the built-in defaults are shown.
 */
export function SiteProvider({ initial, children }: { initial?: SiteContent; children: ReactNode }) {
  const [site, setSite] = useState<SiteContent>(initial ?? DEFAULT_SITE);
  const fetched = useRef(Boolean(initial));

  useEffect(() => {
    if (initial) {
      setSite(initial);
      fetched.current = true;
      return;
    }
    if (fetched.current) return;
    fetched.current = true;
    axios
      .get<SiteContent>('/api/site')
      .then((res) => setSite(res.data))
      .catch(() => {
        fetched.current = false; // try again on the next page
      });
  }, [initial]);

  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);
