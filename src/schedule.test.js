import assert from "node:assert/strict";
import { test } from "node:test";
import { DateTime } from "luxon";
import { TIMEZONE } from "./config.js";
import {
  getLeaderForDate,
  getUpcomingMeeting,
  getUpcomingThursday,
} from "./schedule.js";

function at(iso, hour = 8) {
  return DateTime.fromISO(iso, { zone: TIMEZONE }).set({ hour });
}

test("uses the published leader for a known Thursday", () => {
  assert.deepEqual(getLeaderForDate("2026-08-20"), {
    date: "2026-08-20",
    leader: "Jessica",
    generated: false,
  });
  assert.equal(getLeaderForDate("2026-09-17").leader, "Gianina");
  assert.equal(getLeaderForDate("2026-12-31").leader, "Gianina");
});

test("continues Jessica → Gianina → Eric after the printed schedule", () => {
  assert.deepEqual(getLeaderForDate("2027-01-07"), {
    date: "2027-01-07",
    leader: "Eric",
    generated: true,
  });
  assert.equal(getLeaderForDate("2027-01-14").leader, "Jessica");
  assert.equal(getLeaderForDate("2027-01-21").leader, "Gianina");
});

test("Monday morning reminder points at this week's Thursday", () => {
  const monday = at("2026-09-14", 8);
  assert.equal(getUpcomingThursday(monday).toISODate(), "2026-09-17");
  assert.equal(getUpcomingMeeting(monday).leader, "Gianina");
});

test("after Thursday 5 AM, the next meeting is the following week", () => {
  const afterPrayer = at("2026-09-17", 6);
  assert.equal(getUpcomingThursday(afterPrayer).toISODate(), "2026-09-24");
  assert.equal(getUpcomingMeeting(afterPrayer).leader, "Eric");
});
