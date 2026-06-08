import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleApiRequest } from "../server/router";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await handleApiRequest(req, res);
  } catch (error) {
    console.error("API handler error:", error);
    if (res.writableEnded) return;

    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
    );
  }
}
