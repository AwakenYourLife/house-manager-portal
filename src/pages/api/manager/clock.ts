import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db.ts";
import { dayKey } from "../../../lib/days.ts";
import { ensureDay } from "../../../lib/house.ts";

export const POST: APIRoute = async ({ request, redirect }) => {
  const action = String((await request.formData()).get("action"));
  const key = dayKey();
  const open = await prisma.shift.findFirst({ where: { date: key, clockOut: null } });

  if (action === "in") {
    if (open) return redirect("/today?f=already-in");
    await ensureDay(key);
    await prisma.shift.create({ data: { date: key, clockIn: new Date() } });
    return redirect("/today?f=clocked-in");
  }
  if (action === "out") {
    if (!open) return redirect("/today?f=not-in");
    await prisma.shift.update({ where: { id: open.id }, data: { clockOut: new Date() } });
    return redirect("/today?f=clocked-out");
  }
  return redirect("/today?f=oops");
};
