import { DateTime } from "luxon";
import {
  MEETING_HOUR,
  MEETING_MINUTE,
  MEETING_WEEKDAY,
  PEOPLE,
  ROTATION,
  TIMEZONE,
} from "./config.js";

/** Official Thursday Morning Prayer schedule (through December 31, 2026). */
export const PUBLISHED_MEETINGS = [
  { date: "2026-07-16", leader: "Jessica" },
  { date: "2026-07-23", leader: "Gianina" },
  { date: "2026-07-30", leader: "Eric" },
  { date: "2026-08-06", leader: "Jessica" },
  { date: "2026-08-13", leader: "Gianina" },
  { date: "2026-08-20", leader: "Jessica" },
  { date: "2026-08-27", leader: "Gianina" },
  { date: "2026-09-03", leader: "Eric" },
  { date: "2026-09-10", leader: "Jessica" },
  { date: "2026-09-17", leader: "Gianina" },
  { date: "2026-09-24", leader: "Eric" },
  { date: "2026-10-01", leader: "Jessica" },
  { date: "2026-10-08", leader: "Gianina" },
  { date: "2026-10-15", leader: "Eric" },
  { date: "2026-10-22", leader: "Jessica" },
  { date: "2026-10-29", leader: "Gianina" },
  { date: "2026-11-05", leader: "Eric" },
  { date: "2026-11-12", leader: "Jessica" },
  { date: "2026-11-19", leader: "Gianina" },
  { date: "2026-11-26", leader: "Eric" },
  { date: "2026-12-03", leader: "Jessica" },
  { date: "2026-12-10", leader: "Gianina" },
  { date: "2026-12-17", leader: "Eric" },
  { date: "2026-12-24", leader: "Jessica" },
  { date: "2026-12-31", leader: "Gianina" },
];

const publishedByDate = new Map(
  PUBLISHED_MEETINGS.map((meeting) => [meeting.date, meeting.leader]),
);

const lastPublished = PUBLISHED_MEETINGS[PUBLISHED_MEETINGS.length - 1];
const lastPublishedDate = DateTime.fromISO(lastPublished.date, {
  zone: TIMEZONE,
});
const lastPublishedIndex = ROTATION.indexOf(lastPublished.leader);

export function nowInZone(now = DateTime.now()) {
  return DateTime.isDateTime(now)
    ? now.setZone(TIMEZONE)
    : DateTime.fromJSDate(now, { zone: TIMEZONE });
}

export function getUpcomingThursday(now = DateTime.now()) {
  const current = nowInZone(now);
  const today = current.startOf("day");
  const meetingToday = today.set({
    hour: MEETING_HOUR,
    minute: MEETING_MINUTE,
    second: 0,
    millisecond: 0,
  });

  if (today.weekday === MEETING_WEEKDAY) {
    return current < meetingToday ? today : today.plus({ weeks: 1 });
  }

  const daysUntilThursday = (MEETING_WEEKDAY - today.weekday + 7) % 7;
  return today.plus({ days: daysUntilThursday });
}

export function getLeaderForDate(date) {
  const thursday = DateTime.isDateTime(date)
    ? date.setZone(TIMEZONE).startOf("day")
    : DateTime.fromISO(String(date), { zone: TIMEZONE }).startOf("day");

  if (!thursday.isValid) {
    throw new Error(`Invalid prayer date: ${date}`);
  }

  const iso = thursday.toISODate();
  const publishedLeader = publishedByDate.get(iso);

  if (publishedLeader) {
    return {
      date: iso,
      leader: publishedLeader,
      generated: false,
    };
  }

  const weeksAfterPublished = Math.round(
    thursday.diff(lastPublishedDate, "weeks").weeks,
  );

  if (weeksAfterPublished <= 0 || thursday.weekday !== MEETING_WEEKDAY) {
    return null;
  }

  const leader =
    ROTATION[(lastPublishedIndex + weeksAfterPublished) % ROTATION.length];

  return {
    date: iso,
    leader,
    generated: true,
  };
}

export function getUpcomingMeeting(now = DateTime.now()) {
  const thursday = getUpcomingThursday(now);
  const meeting = getLeaderForDate(thursday);

  if (!meeting) {
    throw new Error(
      `No prayer leader found for ${thursday.toISODate()}. The published schedule starts July 16, 2026.`,
    );
  }

  return decorateMeeting(meeting, now);
}

export function listMeetings({ from, to, now = DateTime.now() } = {}) {
  const start = from
    ? DateTime.fromISO(from, { zone: TIMEZONE }).startOf("day")
    : DateTime.fromISO(PUBLISHED_MEETINGS[0].date, { zone: TIMEZONE });
  const end = to
    ? DateTime.fromISO(to, { zone: TIMEZONE }).endOf("day")
    : DateTime.fromISO(`${start.year + 1}-12-31`, { zone: TIMEZONE }).endOf(
        "day",
      );

  const meetings = [];
  let cursor =
    start.weekday === MEETING_WEEKDAY
      ? start
      : start.plus({ days: (MEETING_WEEKDAY - start.weekday + 7) % 7 });

  while (cursor <= end) {
    const meeting = getLeaderForDate(cursor);
    if (meeting) {
      meetings.push(decorateMeeting(meeting, now));
    }
    cursor = cursor.plus({ weeks: 1 });
  }

  return meetings;
}

export function decorateMeeting(meeting, now = DateTime.now()) {
  const current = nowInZone(now);
  const date = DateTime.fromISO(meeting.date, { zone: TIMEZONE }).set({
    hour: MEETING_HOUR,
    minute: MEETING_MINUTE,
  });
  const person = PEOPLE[meeting.leader];

  return {
    ...meeting,
    name: person?.name ?? meeting.leader,
    email: person?.email ?? null,
    weekday: date.setLocale("en").toFormat("cccc"),
    timeLabel: date.toFormat("h:mm a"),
    timezone: TIMEZONE,
    dateLabelEn: date.setLocale("en").toFormat("MMMM d, yyyy"),
    dateLabelFr: date.setLocale("fr").toFormat("d MMMM yyyy"),
    isoDate: meeting.date,
    isPast: date < current,
    isThisWeek: getUpcomingThursday(current).toISODate() === meeting.date,
  };
}
