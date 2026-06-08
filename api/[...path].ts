import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleApiRequest } from "../server/router";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const segments = req.query.path;
  if (segments) {
    const parts = Array.isArray(segments) ? segments : [segments];
    req.url = `/api/${parts.join("/")}`;
  }

  return handleApiRequest(req, res);
}
