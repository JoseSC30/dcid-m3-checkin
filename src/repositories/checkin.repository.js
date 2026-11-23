import { run } from "../config/database.js";
export async function getFirstCheckin(code) {
  return (
    (await run("SELECT * FROM checkins WHERE code=$1", [code])).rows[0] || null
  );
}
export async function countEventCheckins(eventId) {
  return Number(
    (
      await run("SELECT COUNT(*)::int total FROM checkins WHERE event_id=$1", [
        eventId,
      ])
    ).rows[0].total,
  );
}
