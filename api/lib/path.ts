type PathRequest = {
  url?: string;
  query?: Record<string, string | string[] | undefined>;
};

/** Resolve the API pathname from Vercel rewrites, catch-all params, or direct URLs. */
export const getApiPathname = (req: PathRequest): string => {
  const raw = req.url ?? "/";
  const base = raw.startsWith("http") ? raw : `http://localhost${raw.startsWith("/") ? raw : `/${raw}`}`;
  const normalized = new URL(base).pathname.replace(/\/+$/, "") || "/";

  if (normalized !== "/api" && normalized.startsWith("/api/")) {
    return normalized;
  }

  const segments = req.query?.path;
  if (!segments) return normalized;

  const parts = (Array.isArray(segments) ? segments : [segments]).filter(Boolean);
  return parts.length ? `/api/${parts.join("/")}` : normalized;
};
