import type { IncomingMessage, ServerResponse } from "http";
import {
  clearSessionCookieHeader,
  createSessionToken,
  getSessionFromCookieHeader,
  sessionCookieHeader,
  verifyCredentials,
} from "./auth";
import {
  createPost,
  deletePost,
  getPostById,
  getPublishedPostBySlug,
  listAllPosts,
  listPublishedPosts,
  savePostImageMetadata,
  updatePost,
} from "./posts-db";
import { createPresignedUpload } from "./r2";

type ApiRequest = IncomingMessage & {
  url?: string;
  method?: string;
  headers: IncomingMessage["headers"];
  body?: unknown;
};

type ApiResponse = ServerResponse;

const readJsonBody = (req: ApiRequest): Promise<unknown> => {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "string") {
      return Promise.resolve(req.body ? JSON.parse(req.body) : {});
    }
    if (typeof req.body === "object") {
      return Promise.resolve(req.body);
    }
  }

  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
};

const sendJson = (res: ApiResponse, status: number, data: unknown, headers?: Record<string, string>) => {
  res.statusCode = status;
  for (const [key, value] of Object.entries(headers ?? {})) {
    res.setHeader(key, value);
  }
  if (status === 204) {
    res.end();
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
};

const isSecureRequest = (req: ApiRequest) =>
  req.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production";

const requireSession = (req: ApiRequest) => {
  const cookieHeader = req.headers.cookie;
  const session = getSessionFromCookieHeader(typeof cookieHeader === "string" ? cookieHeader : undefined);
  if (!session) return null;
  return session;
};

const matchPath = (pathname: string, pattern: string) => {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const part = patternParts[i];
    const value = pathParts[i];
    if (part.startsWith(":")) params[part.slice(1)] = value;
    else if (part !== value) return null;
  }
  return params;
};

export const handleApiRequest = async (req: ApiRequest, res: ApiResponse) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  const method = req.method ?? "GET";

  try {
    if (method === "POST" && pathname === "/api/cms/login") {
      const body = (await readJsonBody(req)) as { email?: string; password?: string };
      if (!body.email || !body.password || !verifyCredentials(body.email, body.password)) {
        return sendJson(res, 401, { success: false, error: "Invalid credentials" });
      }
      const token = createSessionToken(body.email);
      return sendJson(
        res,
        200,
        { success: true, email: body.email },
        { "Set-Cookie": sessionCookieHeader(token, isSecureRequest(req)) },
      );
    }

    if (method === "POST" && pathname === "/api/cms/logout") {
      return sendJson(res, 200, { success: true }, {
        "Set-Cookie": clearSessionCookieHeader(isSecureRequest(req)),
      });
    }

    if (method === "GET" && pathname === "/api/cms/me") {
      const session = requireSession(req);
      if (!session) return sendJson(res, 401, { success: false });
      return sendJson(res, 200, { success: true, email: session.email });
    }

    if (method === "GET" && pathname === "/api/posts") {
      const posts = await listPublishedPosts();
      return sendJson(res, 200, posts);
    }

    const slugMatch = matchPath(pathname, "/api/posts/by-slug/:slug");
    if (method === "GET" && slugMatch) {
      const post = await getPublishedPostBySlug(slugMatch.slug);
      if (!post) return sendJson(res, 404, { error: "Not found" });
      return sendJson(res, 200, post);
    }

    if (method === "GET" && pathname === "/api/cms/posts") {
      if (!requireSession(req)) return sendJson(res, 401, { error: "Unauthorized" });
      const posts = await listAllPosts();
      return sendJson(res, 200, posts);
    }

    if (method === "POST" && pathname === "/api/cms/posts") {
      if (!requireSession(req)) return sendJson(res, 401, { error: "Unauthorized" });
      const body = (await readJsonBody(req)) as Parameters<typeof createPost>[0];
      const post = await createPost(body);
      return sendJson(res, 201, post);
    }

    const cmsPostMatch = matchPath(pathname, "/api/cms/posts/:id");
    if (cmsPostMatch) {
      if (!requireSession(req)) return sendJson(res, 401, { error: "Unauthorized" });
      const { id } = cmsPostMatch;

      if (method === "GET") {
        const post = await getPostById(id);
        if (!post) return sendJson(res, 404, { error: "Not found" });
        return sendJson(res, 200, post);
      }

      if (method === "PUT") {
        const body = (await readJsonBody(req)) as Parameters<typeof updatePost>[1];
        const post = await updatePost(id, body);
        if (!post) return sendJson(res, 404, { error: "Not found" });
        return sendJson(res, 200, post);
      }

      if (method === "DELETE") {
        const ok = await deletePost(id);
        if (!ok) return sendJson(res, 404, { error: "Not found" });
        return sendJson(res, 204, null);
      }
    }

    if (method === "POST" && pathname === "/api/cms/images") {
      if (!requireSession(req)) return sendJson(res, 401, { error: "Unauthorized" });
      const body = (await readJsonBody(req)) as {
        objectKey?: string;
        fileUrl?: string;
        folder?: string;
        contentType?: string;
      };
      if (!body.objectKey || !body.fileUrl || !body.folder) {
        return sendJson(res, 400, { error: "objectKey, fileUrl, and folder are required" });
      }
      await savePostImageMetadata({
        objectKey: body.objectKey,
        fileUrl: body.fileUrl,
        folder: body.folder,
        contentType: body.contentType ?? null,
      });
      return sendJson(res, 201, { success: true });
    }

    if (method === "POST" && pathname === "/api/presign-upload") {
      if (!requireSession(req)) return sendJson(res, 401, { success: false, error: "Unauthorized" });
      const body = (await readJsonBody(req)) as {
        fileName?: string;
        contentType?: string;
        folder?: string;
      };
      if (!body.fileName || !body.contentType) {
        return sendJson(res, 400, { success: false, error: "fileName and contentType are required" });
      }
      const result = await createPresignedUpload({
        fileName: body.fileName,
        contentType: body.contentType,
        folder: body.folder,
      });
      return sendJson(res, 200, { success: true, ...result });
    }

    return sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    console.error("API error:", error);
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
