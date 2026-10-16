# House Manager Portal

Where the house manager sees the day's duties, clocks in and out, and reports
on what they did, and where the owner sets the list and reads the report.

A standalone site with its own database. It needs no outside accounts: one
password for the owner, one for the house manager.

## Two sides, chosen by the password

**The house manager** sees:

- **Today** — the owner's note for the day, a Clock in / Clock out button with a
  running timer, the day's duties grouped by area (tick each one, add a note),
  and the end-of-day report.
- **My log** — every past day: hours, what was ticked, the report, the owner's reply.
- **Messages** — the conversation with the owner, with read receipts.

**The owner** sees:

- **Today** — whether they're on the clock, hours so far, duties done, whether
  the report is in, and a box to post a note for the day.
- **Duties** — add, edit, pause or delete duties. Each repeats on chosen weekdays
  or happens once on a date, and can carry an area, a "done by" time, details and
  a priority flag. A fresh install offers a starter list to edit.
- **Log** — one row per workday, with hours, duties done and report status; a day
  that ended without a report is flagged. Open a day to read everything, reply
  to the report (which marks it reviewed), and correct a shift's times.
- **Messages**.

## The accountability rules

- **Only the manager's password can clock in, tick duties or send the report**, so
  every record is the person it says. The owner can't tick on their behalf.
- **Every duty left unticked needs a written reason** before the report will send.
- **Every tick records the time it was made.**
- **Sending the report freezes that day's duty list**, so editing duties later
  never rewrites what was due on a past day. Deleting a duty keeps its title on
  past days.
- **Shift corrections are marked "(corrected)"** in the log, so a time the owner
  fixed is never mistaken for one the manager clocked.
- **A forgotten clock-out is flagged to both people** the next day. The manager is
  told not to clock out late (that would count every hour since) and to message
  the real finish time; the owner corrects it from the log.
- **Messages show "Read" with a time** once the other person opens Messages.

## Time zone

Everything uses `HOUSE_TZ` (default `America/New_York`), not the reader's
device, so "today" and "8:02 AM" mean the same thing to both people wherever
they are.

## Running it locally

```
npm install
npx prisma dev -d -n house-manager-portal     # local Postgres; prints its URL
cp .env.example .env                           # put that URL in DATABASE_URL, set both passwords
npx prisma migrate dev
npm run dev
```

## Deploying (Render, same as the support console)

1. Create a database on Prisma Postgres (console.prisma.io) and copy its
   connection string.
2. Push this folder to a new private GitHub repository.
3. In Render: **New → Blueprint**, pick the repository. `render.yaml` creates the
   service and asks for `DATABASE_URL`, `OWNER_PASSWORD` and `MANAGER_PASSWORD`.
   Use two different passwords; `/api/health` reports if they match.
4. Open `https://<your-service>.onrender.com/api/health`: `"database": "ok"` and
   `"passwordsSet": true` mean it's ready. Add a custom domain in Render's
   Settings if you want one.

- **Build** `npm ci && npx prisma generate && npm run build`
- **Start** `node dist/server/entry.mjs`
- `HOST=0.0.0.0` is required. **Do not set `PORT`**; Render supplies it.
- **Migrations run on every deploy** (`preDeployCommand`), before the new version goes live. A failed migration stops the deploy and the old version keeps serving.

Changing `MANAGER_PASSWORD` in Render signs the manager out on every device and
leaves the owner signed in, and the reverse for `OWNER_PASSWORD`.
