import { getSql, json, validDisplayName } from "./_lib/db.js";
import { sameOrigin } from "./_lib/auth.js";
const GAME_RULES = { blox: { seconds: 120, step: 2 }, rivals: { seconds: 600, step: 5 }, egg: { seconds: 1200, step: 10 }, anime: { seconds: 1800, step: 20 } };
const GAME_IDS = new Set(Object.keys(GAME_RULES));

export default async function handler(req, res) {
  const sql = getSql();
  if (req.method === "GET") {
    const displayName = req.query?.displayName;
    if (!validDisplayName(displayName)) return json(res, 400, { error: "Invalid display name" });
    try {
      await sql`UPDATE gamehub_tasks SET progress_percent = CASE game_id WHEN 'blox' THEN LEAST(100, FLOOR(EXTRACT(EPOCH FROM (NOW() - started_at)) / 120)::int * 2) WHEN 'rivals' THEN LEAST(100, FLOOR(EXTRACT(EPOCH FROM (NOW() - started_at)) / 600)::int * 5) WHEN 'egg' THEN LEAST(100, FLOOR(EXTRACT(EPOCH FROM (NOW() - started_at)) / 1200)::int * 10) WHEN 'anime' THEN LEAST(100, FLOOR(EXTRACT(EPOCH FROM (NOW() - started_at)) / 1800)::int * 20) ELSE progress_percent END, updated_at = NOW() WHERE display_name = ${displayName}`;
      const tasks = await sql`SELECT game_id, started_at, progress_percent, updated_at FROM gamehub_tasks WHERE display_name = ${displayName} ORDER BY started_at DESC`;
      return json(res, 200, { tasks });
    } catch (error) {
      console.error("Task read failed", error?.message);
      return json(res, 500, { error: "Unable to load saved tasks. Check database setup." });
    }
  }
  if (req.method === "POST") {
    if (!sameOrigin(req)) return json(res, 403, { error: "Origin not allowed" });
    const { displayName, gameId } = req.body || {};
    if (!validDisplayName(displayName) || typeof gameId !== "string" || !GAME_IDS.has(gameId)) return json(res, 400, { error: "Invalid task details" });
    try {
      const result = await sql`INSERT INTO gamehub_tasks (display_name, game_id) VALUES (${displayName}, ${gameId}) ON CONFLICT (display_name, game_id) DO NOTHING RETURNING game_id, started_at, progress_percent, updated_at`;
      const rows = result.length ? result : await sql`SELECT game_id, started_at, progress_percent, updated_at FROM gamehub_tasks WHERE display_name = ${displayName} AND game_id = ${gameId}`;
      return json(res, 200, { task: rows[0] });
    } catch (error) {
      console.error("Task save failed", error?.message);
      return json(res, 500, { error: "Unable to save task. Check database setup." });
    }
  }
  res.setHeader("Allow", "GET, POST");
  return json(res, 405, { error: "Method not allowed" });
}
