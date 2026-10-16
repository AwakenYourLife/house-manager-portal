import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { dayKey } from "../../../lib/days.ts";
import { field } from "../../../lib/flash.ts";
import { ensureDay } from "../../../lib/house.ts";

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const dutyId = field(form.get("dutyId"), 40);
  const note = field(form.get("note"), 600);
  const duty = await prisma.duty.findUnique({ where: { id: dutyId } });
  if (!duty) return redirect("/today?f=oops");
  const date = dayKey();
  await ensureDay(date);
  await prisma.completion.upsert({
    where: { date_dutyId: { date, dutyId } },
    create: { date, dutyId, title: duty.title, note },
    update: { note },
  });
  return redirect(`/today?f=note-saved#d-${dutyId}`);
};
