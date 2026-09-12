import nodemailer from "nodemailer";
import { RECIPIENTS, VERSE } from "./config.js";

export function buildReminderEmail(meeting) {
  const subject = `Rappel — Prière de jeudi : ${meeting.name}`;

  const text = [
    `Bonjour Jessica, Gianina et Eric,`,
    ``,
    `Rappel pour la prière du jeudi ${meeting.dateLabelFr} à 5h00.`,
    `Cette semaine, c'est ${meeting.name} qui conduit la prière.`,
    ``,
    `Reminder: Thursday prayer on ${meeting.dateLabelEn} at 5:00 AM.`,
    `This week, ${meeting.name} will lead.`,
    ``,
    `"${VERSE.french}"`,
    `"${VERSE.text}"`,
    `— ${VERSE.reference}`,
    ``,
    `À jeudi,`,
    `PRAYER MEETING REMAINDER`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f6f1e8;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8;border:1px solid #e6dcc8;border-radius:16px;padding:40px 32px;font-family:Georgia,'Times New Roman',serif;color:#1c1915;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#8a6d3b;">PRAYER MEETING REMAINDER</p>
                <h1 style="margin:0 0 24px;font-size:28px;line-height:1.25;font-weight:600;">Cette semaine : ${escapeHtml(meeting.name)}</h1>
                <p style="margin:0 0 16px;font-size:17px;line-height:1.6;">Bonjour Jessica, Gianina et Eric,</p>
                <p style="margin:0 0 16px;font-size:17px;line-height:1.6;">Rappel pour la prière du <strong>jeudi ${escapeHtml(meeting.dateLabelFr)} à 5h00</strong>. Cette semaine, c'est <strong>${escapeHtml(meeting.name)}</strong> qui conduit la prière.</p>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4a453c;">Reminder: Thursday prayer on ${escapeHtml(meeting.dateLabelEn)} at 5:00 AM. This week, ${escapeHtml(meeting.name)} will lead.</p>
                <p style="margin:0;padding:20px 0 0;border-top:1px solid #e6dcc8;font-size:16px;line-height:1.6;font-style:italic;color:#3d5a4c;">« ${escapeHtml(VERSE.french)} »</p>
                <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#8a6d3b;">${escapeHtml(VERSE.reference)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    subject,
    text,
    html,
    to: RECIPIENTS,
  };
}

export function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "Missing SMTP_HOST, SMTP_USER, or SMTP_PASS. Copy .env.example to .env and add your mail settings.",
    );
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export async function sendReminderEmail(meeting, { dryRun = false } = {}) {
  const message = buildReminderEmail(meeting);
  const from =
    process.env.SMTP_FROM ||
    `PRAYER MEETING REMAINDER <${process.env.SMTP_USER || "noreply@localhost"}>`;

  if (dryRun) {
    return {
      dryRun: true,
      from,
      ...message,
    };
  }

  const transporter = createTransport();
  const info = await transporter.sendMail({
    from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  return {
    dryRun: false,
    from,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    ...message,
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
