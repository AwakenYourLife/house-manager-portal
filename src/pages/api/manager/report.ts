import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { dayKey } from "../../../lib/days.ts";
import { field } from "../../../lib/flash.ts";
import { ensureDay, loadDay } from "../../../lib/house.ts";

/**
 * The end-of-day report. Every duty left unticked needs a reason — that is the
 * accountability: nothing on the list can quietly not happen.
 *
 * Sending it freezes the day's duty list, and closes an open shift, so the
 * report and the clock-out are one tap at the end of the day.
 */
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const did = field(form.get("did"), 6000);
  const extra = field(form.get("extra"), 4000);
  const issues = field(form.get("issues"), 4000);
  if (!did) return redirect("/today?edit=1&f=need-did#report");

  const date = dayKey();
  await ensureDay(date);
  const d = await loadDay(date);

  const reasons: { dutyId: string; title: string; reason: string }[] = [];
  for (const i of d.items) {
    if (i.c?.done || !i.dutyId) continue;
    const reason = field(form.get("why:" + i.dutyId), 600);
    if (!reason) return redirect("/today?edit=1&f=need-reasons#report");
    reasons.push({ dutyId: i.dutyId, title: i.title, reason });
  }

  const now = new Date();
  const first = !d.day?.reportAt;
  await prisma.$transaction([
    ...reasons.map((r) =>
      prisma.completion.upsert({
        where: { date_dutyId: { date, dutyId: r.dutyId } },
        create: { date, dutyId: r.dutyId, title: r.title, reason: r.reason },
        update: { reason: r.reason },
      }),
    ),
    prisma.day.update({
      where: { date },
      data: {
        reportDid: did,
        reportExtra: extra,
        reportIssues: issues,
        reportAt: d.day?.reportAt ?? now,
        reportEditedAt: first ? null : now,
        dueSnapshot: d.items.map((i) => ({ dutyId: i.dutyId, title: i.title })),
      },
    }),
    ...(d.openShift ? [prisma.shift.update({ where: { id: d.openShift.id }, data: { clockOut: now } })] : []),
  ]);
  return redirect(`/today?f=${d.openShift ? "report-sent-out" : "report-sent"}#report`);
};
