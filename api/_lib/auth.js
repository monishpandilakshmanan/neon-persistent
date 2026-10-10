import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "rh_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;
function signature(timestamp) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters");
  return createHmac("sha256", secret).update(`gamehub-admin:${timestamp}`).digest("base64url");
}
function cookieValue(req) {
  const header = req.headers.cookie || "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === COOKIE) return rest.join("=");
  }
  return "";
}
export function setAdminCookie(res, token) {
  const secure = process.env.VERCEL ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure}`);
}
export function clearAdminCookie(res) {
  const secure = process.env.VERCEL ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`);
}
export function createAdminToken() {
  const timestamp = String(Math.floor(Date.now() / 1000));
  return `${timestamp}.${signature(timestamp)}`;
}
export function isAdminRequest(req) {
  const token = cookieValue(req);
  const [timestamp, supplied, extra] = token.split(".");
  if (!timestamp || !supplied || extra || !/^\d{10}$/.test(timestamp)) return false;
  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (age < 0 || age > SESSION_SECONDS) return false;
  try {
    const expected = Buffer.from(signature(timestamp));
    const actual = Buffer.from(supplied);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch { return false; }
}
export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return Boolean(host && new URL(origin).host === host);
}
