import { neon } from "@neondatabase/serverless";

let cachedSql;
export function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!cachedSql) cachedSql = neon(process.env.DATABASE_URL);
  return cachedSql;
}
export function json(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}
export function validDisplayName(value) {
  return typeof value === "string" && /^[A-Za-z0-9_]{1,32}$/.test(value);
}
