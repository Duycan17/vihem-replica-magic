import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleApiRequest } from "../server/router";

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleApiRequest(req, res);
}
