import { createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE = "cms_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type SessionPayload = {
  email: string;
  exp: number;
};

const getSessionSecret = () => {
  const secret = process.env.CMS_SESSION_SECRET;
  if (!secret) throw new Error("CMS_SESSION_SECRET is not configured.");
  return secret;
};

const encodePayload = (payload: SessionPayload) =>
  Buffer.from(JSON.stringify(payload)).toString("base64url");

const decodePayload = (encoded: string): SessionPayload | null => {
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
};

const sign = (encoded: string) =>
  createHmac("sha256", getSessionSecret()).update(encoded).digest("base64url");

export const createSessionToken = (email: string) => {
  const payload: SessionPayload = { email, exp: Date.now() + SESSION_TTL_MS };
  const encoded = encodePayload(payload);
  return `${encoded}.${sign(encoded)}`;
};

export const verifySessionToken = (token: string | undefined): SessionPayload | null => {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;

  const payload = decodePayload(encoded);
  if (!payload || payload.exp < Date.now()) return null;
  return payload;
};

export const verifyCredentials = (email: string, password: string) => {
  const expectedEmail = process.env.CMS_AUTH_EMAIL;
  const expectedPassword = process.env.CMS_AUTH_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;
  return email === expectedEmail && password === expectedPassword;
};

export const parseCookies = (header: string | undefined): Record<string, string> => {
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, decodeURIComponent(rest.join("="))];
    }),
  );
};

export const getSessionFromCookieHeader = (cookieHeader: string | undefined) =>
  verifySessionToken(parseCookies(cookieHeader)[SESSION_COOKIE]);

export const sessionCookieHeader = (token: string, secure: boolean) => {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
};

export const clearSessionCookieHeader = (secure: boolean) => {
  const parts = [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (secure) parts.push("Secure");
  return parts.join("; ");
};

export { SESSION_COOKIE };
