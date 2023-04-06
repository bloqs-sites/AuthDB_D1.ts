/**
 * Extracts some useful info from a Request object.
 */
export const extractReq = (req: Request) => {
  const { pathname } = new URL(req.url);
  const [, ...segments] = pathname.split(/\//);
  const { method } = req;
  return { pathname, segments, method } as const;
};

/**
 * CORS and other default headers.
 */
const DEFAULT_HEADERS = new Headers({});

/**
 * An Headers object factory method that encorporates the default headers to
 * help with CORS and cache.
 */
export const headers = (h: Record<string, string> = {}): Headers => {
  const headers = new Headers(DEFAULT_HEADERS);
  for (const k in h) {
    const v = h[k];
    if (v) headers.set(k, v);
  }
  return headers;
};
