# Prayer Recorder

Monday-morning reminder for the Thursday 5:00 AM prayer. Jessica, Gianina, and Eric each receive one email naming who leads that week.

The printed schedule runs through **December 31, 2026**. After that date the app keeps the same rotation: Jessica → Gianina → Eric.

## What runs on Render

A [Render Cron Job](https://render.com/docs/cronjobs) starts every **Monday at 12:00 UTC** (8:00 AM Eastern in summer, 7:00 AM Eastern in winter) and exits after the mail is sent.

Command:

```bash
npm run reminder
```

## Local preview

```bash
cp .env.example .env
npm install
npm test
npm run reminder:dry
npm start
```

- `npm run reminder:dry` prints the email for the coming Thursday without sending it.
- `npm start` opens a schedule page at [http://localhost:3000](http://localhost:3000).

## Send mail (Gmail)

1. On Eric’s Google account, create an [App Password](https://myaccount.google.com/apppasswords).
2. Put these values in `.env` locally and in the Render cron env vars:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=yalshire2004@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=Prayer Recorder <yalshire2004@gmail.com>
```

Then send a real test:

```bash
npm run reminder
```

The message goes to:

- Jessica — `otchague83@yahoo.fr`
- Eric — `yalshire2004@gmail.com`
- Gianina — `otchague@gmail.com`

## Deploy on Render

1. Push this repo to GitHub (or another Git provider connected to Render).
2. In the Render Dashboard, create a **Blueprint** from `render.yaml`, or create a **Cron Job** by hand:
   - **Runtime:** Node
   - **Build command:** `npm ci`
   - **Start command:** `npm run reminder`
   - **Schedule:** `0 12 * * 1` (Monday 12:00 UTC)
3. Set the SMTP environment variables from `.env.example`.
4. On the cron service **Runs** page, click **Trigger Run** once to confirm the first email.

Render bills cron jobs only while they run, with a $1 monthly minimum per cron service.

### Optional web service

If you also want the schedule page online, create a Web Service from the same repo:

- **Build command:** `npm ci`
- **Start command:** `npm start`

You can trigger the same reminder with:

```bash
curl -X POST https://YOUR-SERVICE.onrender.com/api/remind \
  -H "Authorization: Bearer $CRON_SECRET"
```
