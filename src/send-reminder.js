import "dotenv/config";
import { sendReminderEmail } from "./email.js";
import { getUpcomingMeeting } from "./schedule.js";

const dryRun =
  process.argv.includes("--dry-run") || process.env.DRY_RUN === "1";

async function main() {
  const meeting = getUpcomingMeeting();

  console.log(
    `Upcoming prayer: ${meeting.dateLabelEn} at 5:00 AM — ${meeting.name}`,
  );

  const result = await sendReminderEmail(meeting, { dryRun });

  if (result.dryRun) {
    console.log("Dry run — email was not sent.");
    console.log(`To: ${result.to.join(", ")}`);
    console.log(`Subject: ${result.subject}`);
    console.log("");
    console.log(result.text);
    return;
  }

  console.log(`Reminder sent to ${result.accepted?.join(", ") || result.to.join(", ")}`);
  if (result.rejected?.length) {
    console.error(`Rejected: ${result.rejected.join(", ")}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
