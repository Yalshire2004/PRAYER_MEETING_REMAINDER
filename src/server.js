import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sendReminderEmail } from "./email.js";
import { getUpcomingMeeting, listMeetings } from "./schedule.js";
import { TIMEZONE, VERSE } from "./config.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/schedule", (req, res) => {
  const upcoming = getUpcomingMeeting();
  const meetings = listMeetings({
    from: req.query.from,
    to: req.query.to,
  });

  res.json({
    timezone: TIMEZONE,
    verse: VERSE,
    upcoming,
    meetings,
  });
});

app.post("/api/remind", async (req, res) => {
  const secret = process.env.CRON_SECRET;
  const provided =
    req.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    req.query.secret ||
    req.body?.secret;

  if (secret && provided !== secret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const meeting = getUpcomingMeeting();
    const dryRun = req.query.dryRun === "1" || req.body?.dryRun === true;
    const result = await sendReminderEmail(meeting, { dryRun });
    res.json({
      ok: true,
      meeting,
      dryRun: result.dryRun,
      accepted: result.accepted ?? null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Prayer Recorder listening on http://localhost:${port}`);
});
