import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { zonedTime } from "../../../lib/days.ts";
import { field } from "../../../lib/flash.ts";

/** The owner correcting a forgotten clock-out or a wrong time. The shift is marked corrected. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const shift = await prisma.shift.findUnique({ where: { id: field(form.get("id"), 40) } });
  if (!shift) return redirect("/log?f=oops");
  const tin = field(form.get("in"), 5);
  const tout = field(form.get("out"), 5);
  const ok = (t: string) => /^\d{2}:\d{2}$/.test(t);
  if (!ok(tin) || (tout && !ok(tout))) return redirect(`/log/${shift.date}?f=bad-time`);

  const clockIn = zonedTime(shift.date, tin);
  const clockOut = tout ? zonedTime(shift.date, tout) : null;
  if (clockOut && clockOut <= clockIn) return redirect(`/log/${shift.date}?f=bad-time`);

  await prisma.shift.update({ where: { id: shift.id }, data: { clockIn, clockOut, editedByOwner: true } });
  return redirect(`/log/${shift.date}?f=shift-fixed`);
};
