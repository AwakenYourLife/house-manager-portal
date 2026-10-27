import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { dayKey, mondayOf } from "../../../lib/days.ts";
import { field } from "../../../lib/flash.ts";
import { payrollSettings, rateFor } from "../../../lib/payroll.ts";

/** Saves the rate and scheduled hours. A changed rate starts this week; past weeks keep theirs. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const rate = Number(field(form.get("rate"), 10).replace(/[$,]/g, ""));
  const hours = Number(field(form.get("hours"), 6));
  if (!(rate > 0 && rate < 10000) || !(hours > 0 && hours <= 168)) return redirect("/payroll?edit=1&f=bad-pay#settings");

  const rateCents = Math.round(rate * 100);
  const scheduledMinutes = Math.round(hours * 60);
  const monday = mondayOf(dayKey());
  const { rates } = await payrollSettings();

  await prisma.settings.upsert({ where: { id: 1 }, create: { id: 1, scheduledMinutes }, update: { scheduledMinutes } });
  if (rateFor(monday, rates) !== rateCents) {
    await prisma.payRate.upsert({ where: { effectiveFrom: monday }, create: { effectiveFrom: monday, rateCents }, update: { rateCents } });
  }
  return redirect("/payroll?f=pay-saved");
};
