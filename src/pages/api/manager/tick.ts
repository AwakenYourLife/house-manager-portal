import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { dayKey } from "../../../lib/days.ts";
import { field } from "../../../lib/flash.ts";
import { ensureDay } from "../../../lib/house.ts";

/** Ticks a duty done for today, or unticks it. The time it was ticked is the record. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const dutyId = field((await request.formData()).get("dutyId"), 40);
  const duty = await prisma.duty.findUnique({ where: { id: dutyId } });
  if (!duty) return redirect("/today?f=oops");
  const date = dayKey();
  await ensureDay(date);
  const cur = await prisma.completion.findUnique({ where: { date_dutyId: { date, dutyId } } });
  const done = !cur?.done;
  await prisma.completion.upsert({
    where: { date_dutyId: { date, dutyId } },
    create: { date, dutyId, title: duty.title, done, doneAt: done ? new Date() : null },
    update: { title: duty.title, done, doneAt: done ? new Date() : null },
  });
  return redirect(`/today#d-${dutyId}`);
};
